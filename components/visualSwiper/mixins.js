export const visualSwiperMixins = {
  data() {
    const { windowHeight, windowWidth } = uni.getSystemInfoSync()
    return {
      videoList: [],
      videoTotal: 0,
      swiperWidth: windowWidth,
      swiperHeight: windowHeight,
      currentSwiperIdx: 0,
      currentPageIdx: 0,
      pageIdxMapper: [0, 1, 2, 3, 4],
      atAnimation: false,
      pageChangeTimer: null,
      swiperDuration: 166,
      swiperDebug: true
    }
  },
  computed: {
    swiperStyle() {
      return this.mapStyleToStr({
        width: this.swiperWidth + 'px',
        height: this.swiperHeight + 'px',
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
      if ((this.videoTotal - maxPageId) < 8) {
        this.onSwiperLoadMore && this.onSwiperLoadMore()
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
      }, 10)
    }
  },
  onSwiperAnimationFinish() {
    clearInterval(this.pageChangeTimer)
    this.atAnimation = false
  }
}
