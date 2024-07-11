<template>
  <view
    class="visual-swipper"
    :style="swiperStyle"
  >
    <swiper
      class="visual-swipper-elem"
      :circular="getSwiperCircular"
      :style="swiperStyle"
      vertical
      skip-hidden-item-layout
      :duration="swiperDuration"
      @change="onSwiperChange"
    >
      <swiper-item>
        <slot name="item1" :idx="pageIdxMapper[0]" :active="currentSwiperIdx == 0" :ready="!atAnimation" :payload="getItem1Payload"></slot>
      </swiper-item>
      <swiper-item>
        <slot name="item2" :idx="pageIdxMapper[1]" :active="currentSwiperIdx == 1" :ready="!atAnimation" :payload="getItem2Payload"></slot>
      </swiper-item>
      <swiper-item>
        <slot name="item3" :idx="pageIdxMapper[2]" :active="currentSwiperIdx == 2" :ready="!atAnimation" :payload="getItem3Payload"></slot>
      </swiper-item>
      <swiper-item>
        <slot name="item4" :idx="pageIdxMapper[3]" :active="currentSwiperIdx == 3" :ready="!atAnimation" :payload="getItem4Payload"></slot>
      </swiper-item>
      <swiper-item>
        <slot name="item5" :idx="pageIdxMapper[4]" :active="currentSwiperIdx == 4" :ready="!atAnimation" :payload="list[pageIdxMapper[4]]"></slot>
      </swiper-item>
    </swiper>
    <view v-if="debug" class="debug-info">
      <view>
        <text class="is-text">currentSwiperIdx：{{ currentSwiperIdx }}</text>
      </view>
      <view>
        <text class="is-text">pageIdxMapper：{{ JSON.stringify(pageIdxMapper) }}</text>
      </view>
      <view>
        <text class="is-text">当前页面ID：{{ pageIdxMapper[currentSwiperIdx] }}</text>
      </view>
      <view>
        <text class="is-text">当前SwiperIdx：{{ currentSwiperIdx }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    width: { default: uni.getSystemInfoSync().windowWidth },
    height: { default: uni.getSystemInfoSync().windowHeight },
    list: { default: () => ([]) },
    total: { default: 0 },
    swiperDuration: { default: 166 },
    debug: { default: false }
  },
  data() {
    return {
      currentSwiperIdx: 0,
      currentPageIdx: 0,
      pageIdxMapper: [0, 1, 2, 3, 4],
      atAnimation: false,
      pageChangeTimer: null
    }
  },
  computed: {
    swiperStyle() {
      return this.mapStyleToStr({
        width: this.width + 'px',
        height: this.height + 'px',
      })
    },
    getSwiperCircular() {
      const pageIdxMapper = this.pageIdxMapper
      if (pageIdxMapper[0] == 0) {
        return false
      }
      if (pageIdxMapper[4] >= this.total) {
        return false
      }
      return true
    },
    getItem1Payload() {
      return this.list[this.pageIdxMapper[0]] || {}
    },
    getItem2Payload() {
      return this.list[this.pageIdxMapper[1]] || {}
    },
    getItem3Payload() {
      return this.list[this.pageIdxMapper[2]] || {}
    },
    getItem4Payload() {
      return this.list[this.pageIdxMapper[3]] || {}
    },
    getItem5Payload() {
      return this.list[this.pageIdxMapper[4]] || {}
    }
  },
  methods: {
    mapStyleToStr(map) {
      const str = []
      for (let key in map) {
        str.push(`${key}:${map[key]}`)
      }
      return str.join(';')
    },
    onSwiperChange({ detail }) {
      this.atAnimation = true
      const { current } = detail
      let isMoveToNext = true
      const moveSwiperIndex = current - this.currentSwiperIdx
      if (moveSwiperIndex == 1 || moveSwiperIndex == -4) {
        isMoveToNext = true
      } else if (moveSwiperIndex == -1 || moveSwiperIndex == 4) {
        isMoveToNext = false
      }
      console.log('滑动方向', isMoveToNext ? '下一个' : '上一个')
      this.currentSwiperIdx = current
      const oldPageIdx = this.currentPageIdx
      if (isMoveToNext) {
        this.currentPageIdx = oldPageIdx + 1
      } else {
        this.currentPageIdx = oldPageIdx - 1
      }
      this.updateIndexMapper()
    },
    updateIndexMapper() {
      const currentPageIdx = this.currentPageIdx
      const currentSwiperIdx = this.currentSwiperIdx
      const maxPageId = currentPageIdx + 2 >= this.total ? this.total : (currentPageIdx + 2)
      if ((this.total - maxPageId) < 8) {
        this.$emit('loadmore')
      }
      const pageIdxArr = [currentPageIdx]
      for (let i = 1; i <= 4; i++) {
        let curr = currentPageIdx + i
        if (curr <= maxPageId) {
          // 后面的视频
          pageIdxArr.push(curr)
        } else {
          // 前面的视频
          curr = currentPageIdx - (5 - pageIdxArr.length)
          pageIdxArr.push(curr)
        }
      }
      const arr = [...this.pageIdxMapper]
      // 填充数据
      pageIdxArr.map((pageIdx, idx) => {
        let swiperIdx = currentSwiperIdx + idx
        if (swiperIdx > 4) {
          swiperIdx = swiperIdx - 5
        }
        arr[swiperIdx] = pageIdx
      })
      this.pageIdxMapper = arr
      clearInterval(this.pageChangeTimer)
      this.pageChangeTimer = setTimeout(() => {
        this.atAnimation = false
      }, 50)
    }
  },
}
</script>

<style lang="scss" scoped>
.visual-swipper {
  position: relative;
  background: #000;
  .debug-info {
    position: absolute;
    left: 10px;
    top: 10px;
    padding: 10px;
    background: rgba(#000, 0.6);
    border-radius: 10px;
    .is-text {
      font-size: 14px;
      color: #fff;
    }
  }
}
</style>
