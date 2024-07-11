class zionUniMpLoadPackagePlugin {
  apply(compiler) {

    const inputPath = process.env.UNI_INPUT_DIR

    function getLoadMpPackageCode(path) {
      return `\r\nfunction loadMpPackage(a,b,c){require.async('${path}'+a+'/common/vendor.js').then(b).catch(c)};`
    }

    compiler.hooks.compilation.tap('module-id', (compilation) => {
      // Tap into the module identifier hook
      compilation.hooks.optimizeModuleIds.tap('zionUniMpLoadPackagePlugin', modules => {
        for (let module of modules) {
          if (module && module.resource && module.resource.indexOf(inputPath) >= 0) {
            if (module.resource.indexOf('.js') >= 0) {
              const splited = module.resource.split(inputPath)
              module.id = splited[1] || splited[0]
            }
          }
        }
      });
    });

    compiler.hooks.emit.tap('zionUniMpLoadPackagePlugin', (compilation) => {
      const files = ['common/vendor.js', 'common/main.js']
      Object.keys(compilation.assets).map(fileUrl => {
        if (!fileUrl.endsWith('.js')) {
          return
        }
        let content = compilation.assets[fileUrl].source();
        if (content.indexOf('loadMpPackage') >= 0) {
          const absPath = fileUrl.split('/')
            .map((o, oi) => oi == 0 ? '' : '../')
            .filter(o => o)
            .join('')
          while (content.indexOf('loadMpPackage(') >= 0) {
            // 替换加载函数
            let startIdx = content.indexOf('loadMpPackage(')
            let endIdx = startIdx + 'loadMpPackage'.length
            content = replaceStringAtPosition(content, startIdx, endIdx, 'require')
            endIdx = startIdx + 'require'.length
            // 替换包地址
            let quoted = ''
            if (content.indexOf('"', endIdx) == (endIdx + 1)) {
              quoted = '"'
            } else {
              quoted = "'"
            }
            startIdx = content.indexOf(quoted, startIdx)
            endIdx = content.indexOf(quoted, startIdx + 1)
            const packageName = content.substring(startIdx, endIdx)
            let packagePath = [absPath, packageName, '/common/vendor.js'].join('')
            packagePath = packagePath.replace(/"/g, '').replace(/'/g, '')
            content = replaceStringAtPosition(content, startIdx, endIdx + 1, `${quoted}${packagePath}${quoted}`)
          }
          // content = content + getLoadMpPackageCode(absPath)
        }
        if (content.indexOf('loadMpPackageModule') >= 0) {
          if (process.env.mode == 'development') {
            content = content.replace(/loadMpPackageModule/g, '__webpack_require__');
          } else {
            content = content.replace(/loadMpPackageModule/g, 'a');
          }
        }
        compilation.assets[fileUrl] = {
          source() {
            return content;
          },
          size() {
            return content.length;
          },
        };
      })
    });
  }
}

function replaceStringAtPosition(originalStr, start, end, replaceWith) {
  return originalStr.substring(0, start) + replaceWith + originalStr.substring(end);
}

module.exports = {
  zionUniMpLoadPackagePlugin
}
