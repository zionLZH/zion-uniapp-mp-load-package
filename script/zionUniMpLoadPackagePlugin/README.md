# zion-uniapp-mp-load-package
这是一个uniapp微信小程序跨包加载js的插件，支持vue2、vue3。

## 安装
使用npm的开发者请使用以下命令安装本插件
````
npm install zion-uniapp-mp-load-package -D
````
使用yarn的开发者请使用以下命令安装本插件
````
yarn add zion-uniapp-mp-load-package -D
````

## 使用方法
### Vue2
对应uniapp工程使用Vue2 + Webpack的开发者，请在项目根目录下创建vue.config.js，并且复制以下模板之后重新启动调试即可
````
const path = require('path')
const { zionUniMpLoadPackagePlugin } = require('zionUniMpLoadPackagePlugin/webpack')
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

````
如果您已经创建过vue.config.js，只需要做以下2处改动即可。
- 1. 引入插件，请在module.exports之前引入插件
````
const { zionUniMpLoadPackagePlugin } = require('zionUniMpLoadPackagePlugin/webpack')
````
- 2添加插件，并且配置moduleIds为named
 ````
module.exports = {
  // ...此处可能是一些您原有的配置
  configureWebpack: {
    // ...此处可能是一些您原有的配置
    plugins: [
      // ...此处可能是一些您原有的配置
      // 请把本插件放置最后  
      new zionUniMpLoadPackagePlugin()
    ],
    optimization: {
      moduleIds: 'named',
    }
  },
}
````

### Vue3
对应uniapp工程使用Vue3 + Vite的开发者，请在项目根目录下创建vite.config.js，并且复制以下模板之后重新启动调试即可
````
import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import { zionUniMpLoadPackagePlugin } from './script/zionUniMpLoadPackagePlugin/vite'

export default defineConfig({
  plugins: [
    uni(),
    zionUniMpLoadPackagePlugin()
  ],
});

````
如果您已经创建过vite.config.js，只需要做以下2处改动即可。
- 1. 引入插件，defineConfig之前引入插件
````
import { zionUniMpLoadPackagePlugin } from './script/zionUniMpLoadPackagePlugin/vite'
````
- 2添加插件
 ````
import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import { zionUniMpLoadPackagePlugin } from './script/zionUniMpLoadPackagePlugin/vite'

export default defineConfig({
  plugins: [
    uni(),
    // 请把本插件放置最后  
    zionUniMpLoadPackagePlugin()
  ],
});
````

### 调用方法
当你添加了本插件之后，就可以使用本插件提供的俩个api，直接加载跨包的js（当然这一切是异步化的）
````
loadMpPackage("packageA", () => {
    // ...
    console.log('加载成功')
    console.log(loadMpPackageModule('/packageA/sdk/index.js'))
    console.log(loadMpPackageModule('/packageA/sdk/index.js').a())
}, ({mod, errMsg}) => {
    // ...
    console.log('加载出错', mod, errMsg)
})
````

## 常见问题
### 分包之后编译后对应的js没有出现在编译结果
请参考git对应的demo工厂中的配置，此处我们需要虚构一个页面并且配置在pages.json的subpackages内
[对应页面hack.vue](https://github.com/zionLZH/zion-uniapp-mp-load-package/blob/main/packageA/hack.vue)
[对应的pages.json配置](https://github.com/zionLZH/zion-uniapp-mp-load-package/blob/main/pages.json#L27)

## 联系我
对于git有其他问题的，可以前往git提交issue或者发邮件联系我。

## Donate
如果我的插件对你有帮助可以请我喝杯咖啡呀  


![donate.png](https://raw.githubusercontent.com/zionLZH/zion-uniapp-mp-load-package/main/donate.png)
