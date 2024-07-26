const fs = require('fs')
const path = require('path')
const json5 = require('json5')
class zionUniMpLoadPackagePlugin {
  apply(compiler) {

    const inputPath = process.env.UNI_INPUT_DIR

    let pages = json5.parse(
      fs.readFileSync(path.join(inputPath, 'pages.json'), 'utf8')
    )
    let subPackages = (pages.subPackages || []).map(o => o.root)

    function getLoadMpPackageCode(path) {
      return `\r\nfunction loadMpPackage(a,b,c){require.async('${path}'+a+'/common/vendor.js').then(b).catch(c)};`
    }

    function isNeedRebuildModuleId(modulePath) {
      if (modulePath.indexOf('node_modules') >= 0) {
        return false
      }
      // 判断是否是在分包里面的
      const hasSubPackage = subPackages.findIndex(o => modulePath.indexOf(o) >= 0)
      return hasSubPackage >= 0
    }

    let ids = []
    function stringToFourCharHash(str) {
      let idx = ids.indexOf(str)
      if (idx >= 0) {
        return 's' + idx
      }
      idx = ids.push(str) - 1
      return 's' + idx
      let hash = 5381;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        // Convert to 32bit integer
        hash &= hash;
      }
      // Convert the hash to hexadecimal and pad with zeros if necessary
      return ('0000' + hash.toString(16).toUpperCase()).slice(-4);
    }

    compiler.hooks.compilation.tap('module-id', (compilation) => {
      // Tap into the module identifier hook
      compilation.hooks.optimizeModuleIds.tap('zionUniMpLoadPackagePlugin', modules => {
        for (let module of modules) {
          if (module && module.resource && module.resource.indexOf(inputPath) >= 0) {
            if (module.resource.indexOf('.js') >= 0 || module.resource.indexOf('.ts') >= 0) {
              const needRebuild = isNeedRebuildModuleId(module.resource)
              if (needRebuild) {
                const splited = module.resource.split(inputPath).map(o => o.replace(/\\/gi, '/'))
                module.id = splited[1] || splited[0]
              } else {
                module.id = stringToFourCharHash(module.resource)
              }
            }
          } else if (module && module.resource) {
            module.id = stringToFourCharHash(module.resource)
          }
        }
      });
    });

    compiler.hooks.emit.tap('zionUniMpLoadPackagePlugin', (compilation) => {
      const files = ['common/vendor.js', 'common/main.js']
      Object.keys(compilation.assets).map(fileUrl => {
        if (!fileUrl.endsWith('.js') && !fileUrl.endsWith('.ts')) {
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
          // hbx3.9.x开始判断是否为开发环境用process.env.BABEL_ENV == 'development'
          const hasWebpackRequire = content.indexOf('__webpack_require__') >= 0 // 兼容运行时压缩
          if ((process.env.mode == 'development' || process.env.BABEL_ENV == 'development') && hasWebpackRequire) {
            content = content.replace(/loadMpPackageModule/g, '__webpack_require__');
          } else {
            // 在这里要特殊处理，要根据这个去找对应的webpack require
            const loadIdx = content.indexOf(`){"use strict"`)
            const loadFnName = content.substr(loadIdx - 1, 1)
            // 重定向loadFnName，因为webpack的加载函数在压缩的时候可能会被其他代码变量覆盖
            content = content.replace(/"use strict"/gi, `"use strict";var w_require=${loadFnName};`)
            content = content.replace(/loadMpPackageModule/g, 'w_require');
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
