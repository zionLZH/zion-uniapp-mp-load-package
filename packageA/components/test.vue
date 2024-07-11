<template>
  <view>
    <view>这是组件内的内容：</view>
    <view>我是异步组件</view>
    <view>这是组件slot的内容：</view>
    <view><slot></slot></view>
    <view>这是组件props的内容：</view>
    <view>{{test}}</view>
  </view>
</template>

<script>
  export default {
    props: {
      test: {}
    }
  }
</script>

<style>
</style>