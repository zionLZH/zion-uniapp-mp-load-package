export function zionUniMpLoadPackagePlugin() {
  return {
    name: 'zionUniMpLoadPackagePlugin',
    generateBundle(_, bundle) {
      const inputPath = process.env.UNI_INPUT_DIR

      function getLoadMpPackageModuleCode(path) {
        return `\r\nfunction loadMpPackageModule(a){return require('${path}'+a)};`
      }

      function getLoadMpPackageCode(path) {
        return `\r\nfunction loadMpPackage(a,b,c){require.async('${path}'+a+'/_pkg_load_.js').then(b).catch(c)};`
      }

      // 先读出来app.json，这里是要来注入一下hack
      if (bundle['app.json']) {
        const appJsonCode = JSON.parse(bundle['app.json'].source)
        appJsonCode.subPackages.map(pkg => {
          const { root } = pkg
          const path = `${root}/_pkg_load_.js`
          if (!bundle[path]) {
            bundle[path] = {
              fileName: path,
              type: 'js',
              source: '0;',
              code: '0;'
            }
          }
        })
      }

      Object.keys(bundle).map(fileUrl => {
        if (!fileUrl.endsWith('.js')) {
          return
        }

        let content = bundle[fileUrl].code;
        if (fileUrl == 'common/vendor.js') {
          let append = `\r\nglobal['loadMpPackage'] = function(a,b){b()};`
          if (content.indexOf(append) < 0) {
            content = `${append}${content}`
          }
        }
        if (content.indexOf('loadMpPackage(') >= 0) {
          const absPath = fileUrl.split('/')
            .map((o, oi) => oi == 0 ? '' : '../')
            .filter(o => o)
            .join('')

          while (content.indexOf('loadMpPackage(') >= 0) {
            // 替换加载函数
            let startIdx = content.indexOf('loadMpPackage(')
            let endIdx = startIdx + 'loadMpPackage'.length
            content = replaceStringAtPosition(content, startIdx, endIdx, 'require')
            // 替换包地址
            startIdx = content.indexOf('"', startIdx)
            endIdx = content.indexOf('"', startIdx + 1)
            const packageName = content.substring(startIdx, endIdx)
            const packagePath = [absPath, packageName, '/_pkg_load_.js'].join('')
            content = replaceStringAtPosition(content, startIdx, endIdx + 1, `"${packagePath.replace(/"/gi, '')}"`)
          }
          // let append = getLoadMpPackageCode(absPath)
          // if (content.indexOf(append) < 0) {
          //   content = `${append}${content}`
          // }
        }

        if (content.indexOf('loadMpPackageModule') >= 0) {
          const absPath = fileUrl.split('/')
            .map((o, oi) => oi == 0 ? '' : '../')
            .filter(o => o)
            .join('')
          let append = getLoadMpPackageModuleCode(absPath)
          if (content.indexOf(append) < 0) {
            content = `${append}${content}`
          }
        }

        bundle[fileUrl].code = content
      })
    },
  };
}

function replaceStringAtPosition(originalStr, start, end, replaceWith) {
  return originalStr.substring(0, start) + replaceWith + originalStr.substring(end);
}
