const path = require('path')
const { zionUniMpLoadPackagePlugin } = require('./script/zionUniMpLoadPackagePlugin/webpack')
module.exports = {
  configureWebpack: {
    plugins: [
      new zionUniMpLoadPackagePlugin()
    ],
    optimization: {
      moduleIds: 'named',
    }
  },
}
