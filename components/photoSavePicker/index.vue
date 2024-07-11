<template>
  <view class="photo-save-picker">
    <text class="title-container">{{ getTitle }}</text>
    <image class="is-close-btn" src="/static/photoSavePicker/icon_close.png" @click="doClose"></image>
    <scroll-view class="images-container" enable-flex scroll-x :show-scrollbar="false">
      <view class="photo-list">
        <template v-for="item in imageList">
          <view class="photo-item" @click="doCheckItem(item)">
            <image class="is-photo" :src="item.url" mode="widthFix" lazy-load :draggable="false"></image>
            <view v-if="item.checked" class="is-mark"></view>
            <view v-if="!item.checked" class="is-pick-btn"></view>
            <image v-if="item.checked" class="is-picked" src="/static/photoSavePicker/icon_checked.png"></image>
          </view>
        </template>
      </view>
    </scroll-view>
    <view class="action-group">
      <view class="is-full-check" @click="doFullCheck">
        <view class="is-pick-btn">
          <image v-if="getIsFullCheck" class="is-picked" src="/static/photoSavePicker/icon_checked.png"></image>
        </view>
        <text class="is-text">全选</text>
      </view>
      <text v-if="getCheckedCount == 0" class="is-submit-btn disabled">保存</text>
      <text v-else class="is-submit-btn" @click="doSubmit">保存</text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    list: {
      default: () => ([])
    },
    current: {
      default: null,
    }
  },
  data() {
    return {
      imageList: [],
    }
  },
  mounted() {
    this.imageList = this.list.map((item, idx) => {
      let checked = false
      if (idx === this.current) {
        checked = true
      } else if (item == this.current) {
        checked = true
      }
      return {
        url: item,
        checked: checked,
      }
    })
  },
  computed: {
    getTitle() {
      return `已选择 ${this.getCheckedCount || 0} 张图片`
    },
    getCheckedCount() {
      return this.imageList.filter(o => o.checked == true).length
    },
    getIsFullCheck() {
      return this.getCheckedCount == this.imageList.length
    },
  },
  methods: {
    doClose() {
      this.$emit('close')
    },
    doCheckItem(item) {
      item.checked = !item.checked
    },
    doFullCheck() {
      const checked = !this.getIsFullCheck
      this.imageList.map(o => {
        o.checked = !!checked
      })
    },
    loading(title) {
      uni.showLoading({ title: `${title}%`, mask: true })
    },
    toast(title) {
      uni.hideLoading()
      uni.showToast({ icon: 'none', title })
    },
    downloadFile(url, progressCallback) {
      return new Promise(resolve => {
        const task = uni.downloadFile({
          url: url, //仅为示例，并非真实接口地址。
          success: ({ tempFilePath }) => {
            resolve(tempFilePath)
          },
          fail: (e) => {
            console.log('下载', url, '出错')
            console.log('下载报错', e)
            resolve(null)
          }
        });
        task.onProgressUpdate(({ progress }) => {
          progressCallback && progressCallback(progress)
        })
      })
    },
    saveFile(path) {
      return new Promise(resolve => {
        uni.saveImageToPhotosAlbum({
          filePath: path,
          success() {
            resolve(true)
          },
          fail(e) {
            console.log('保存', path, '出错')
            console.log('保存报错', e)
            resolve(false)
          }
        })
      })
    },
    async doSubmit() {
      const dlList = this.imageList.filter(o => o.checked == true).map(o => o.url)
      const pgList = new Array(dlList.length).fill(0)
      const partPg = 100 / pgList.length
      const saveFiles = []

      const updatePg = () => {
        let total = 0
        pgList.map(o => total = total + o)
        this.loading(total.toFixed(0) * 1)
      }
      this.loading(0)
      for (let i = 0; i < dlList.length; i++) {
        const url = dlList[i]
        const file = await this.downloadFile(url, pg => {
          pgList[i] = pg / 100 * partPg
          updatePg()
        })
        if (!file) {
          this.toast('下载图片出错，请稍候尝试')
          return
        }
        saveFiles.push(file)
      }
      for (let i = 0; i < saveFiles.length; i++) {
        const isSuccess = this.saveFile(saveFiles[i])
        if (!isSuccess) {
          this.toast('保存图片出错，请稍候尝试')
          return
        }
      }
      this.toast('保存完成')
    }
  },
}
</script>

<style scoped lang="scss">
.photo-save-picker {
  display: flex;
  flex-direction: column;
  position: relative;
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;
  * { box-sizing: border-box }
  .title-container {
    width: 750rpx;
    height: 115rpx;
    line-height: 115rpx;
    text-align: center;
    font-size: 24rpx;
    color: #333;
    font-weight: bold;
  }

  .is-close-btn {
    position: absolute;
    right: 42rpx;
    width: 32rpx;
    height: 32rpx;
    top: 41.5rpx;
  }

  $itemH: 307rpx;
  $itemW: 216rpx;
  $itemRadius: 10rpx;
  $itemMg: 40rpx;
  .images-container {
    height: $itemH;
    width: 750rpx;
    display:flex;
    flex-direction: row;
    .photo-list {
      margin-left: $itemMg;
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
    }
    .photo-item {
      height: $itemH;
      width: $itemW;
      margin-right: $itemMg;
      position: relative;
      border-radius: $itemRadius;
      background: #000;
      display: flex;
      justify-content: center;
      align-items: center;

      .is-photo {
        width: $itemW;
        height: $itemH;
        border-radius: $itemRadius;
      }
      .is-pick-btn {
        position: absolute;
        right: 20rpx;
        top: 20rpx;
        width: 36rpx;
        height: 36rpx;
        border: 2rpx solid #fff;
        border-radius: 36rpx;
        background: rgba(#000, 0.2);
      }
      .is-picked {
        @extend .is-pick-btn;
        background: #fff;
      }
      .is-mark {
        @extend .is-photo;
        position: absolute;
        left: 0;
        top: 0;
        background: rgba(#000, 0.4);
      }
    }
  }

  .action-group {
    height: 64rpx;
    width: 750rpx;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0 $itemMg;
    margin: 25rpx 0;

    .is-full-check {
      display: flex;
      flex-direction: row;
      align-items: center;
      .is-pick-btn {
        width: 36rpx;
        height: 36rpx;
        border: 2rpx solid #fff;
        border-radius: 36rpx;
        background: rgba(#000, 0.2);
        display: flex;
        justify-content: center;
        align-items: center;

        .is-picked {
          width: 32rpx;
          height: 32rpx;
          border-radius: 36rpx;
          background: #fff;
        }
      }

      .is-text {
        font-size: 24rpx;
        line-height: 24rpx;
        color: #666;
        padding-left: 20rpx;
      }
    }

    .is-submit-btn {
      width: 124rpx;
      height: 64rpx;
      line-height: 64rpx;
      text-align: center;
      background: #F4476B;
      color: #fff;
      font-size: 24rpx;
      border-radius: 32rpx;
      &.disabled {
        background: #cccccc;
      }
    }
  }
}
</style>
