<template>
  <view>
    <view>我是test inner</view>
    <button @click="pgAJs">load pgA js</button>
  </view>
</template>

<script>

export default {
  components: {
  },
  data() {
    return {
    }
  },
  methods: {
    pgAJs() {

      loadMpPackage('packageA', res => {
        // ...
        console.log('加载成功', res)
        console.log(loadMpPackageModule('/packageA/sdk/index.js'))
        console.log(loadMpPackageModule('/packageA/sdk/index.js').a())
      }, ({mod, errMsg}) => {
        // ...
      })
    }
  }
}
</script>

<style>
</style>
