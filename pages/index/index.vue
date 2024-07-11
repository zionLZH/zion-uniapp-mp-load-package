<template>
  <view style="width: 100vw;height: 100vh;background:#f2f2f2;">
    <view>这是页面内容</view>
    <sync-comp :test="123">这是外面传进来的内容</sync-comp>
    <view>这是子组件</view>
    <innerComp/>
    <button @click="pgAJs">load pgA js</button>
    <button @click="packageA">goto</button>
  </view>
</template>

<script>
  import inner from './inner.vue'
export default {
  components: {
    innerComp: inner
  },
  data() {
    return {
      }
  },
  methods: {
    pgAJs() {

      loadMpPackage("packageA", () => {
        // ...
        console.log('加载成功')
        console.log(loadMpPackageModule('/packageA/sdk/index.js'))
        console.log(loadMpPackageModule('/packageA/sdk/index.js').a())
      }, ({mod, errMsg}) => {
        // ...
        console.log('加载出错', mod, errMsg)
      })
    },
    packageA() {
      uni.navigateTo({
        url: '/pages/index/test/inner'
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
