// pages/bookDetail/index.js
const app = getApp()
import { queryBookUrl, buyBookUrl } from '../../config/api'

Page({
  data: {
    // 书籍信息
    bookInfo: {},
    // 是否正在下载
    downloading: false,
    downloadPercent: 0, // 书籍下载百分比
    // 评论是否正在加载
    commentLoading: false,
    is_buy: 0, // 是否已购买书籍， 1: true, 0: fase
    comments: []  // 评论列表
  },
  onLoad(options) {
    const bookInfo = {};
    for (let key in options) {
      bookInfo[key] = decodeURIComponent(options[key]);
    }
    this.setData({
      bookInfo: bookInfo
    });
    this.getMoreInfo();
  },
  // 获取更多信息，如评论和是否购买
  getMoreInfo() {
    this.setData({
      commentLoading: true
    })
    wx.request({
      url: queryBookUrl,
      method: 'GET',
      data: {
        bookid: this.data.bookInfo.id,
        skey: app.getLoginFlag()
      },
      success: (res) => {
        const { code, data } = res.data || {}
        const { is_buy, comments } = data || []
        if (!code) {
          this.setData({
            comments,
            is_buy,
            commentLoading: false
          })
        }
      },
      fail: (error) => {
        this.showInfo('请求失败');
        this.setData({
          commentLoading: false
        })
      }
    });
  },
  showInfo: function (info, icon = 'none') {
    wx.showToast({
      title: info,
      icon: icon,
      duration: 1500,
      mask: true
    });
  },
  // 跳转评论页
  goComment(ev) {
    const dataset = ev.currentTarget.dataset;
    let navigateUrl = '../comment/index?';
    for (let key in dataset) {
      dataset[key] = encodeURIComponent(dataset[key]);
      navigateUrl += key + '=' + dataset[key] + '&';
    }
    navigateUrl = navigateUrl.substring(0, navigateUrl.length - 1);
    wx.navigateTo({
      url: navigateUrl
    });
  },
  // 兑换书籍
  handleBuyBook() {
    wx.showModal({
      title: '提示',
      content: '确定用1积分兑换此书吗？',
      showCancel: true,
      cancelText: '打扰了',
      cancelColor: '#8a8a8a',
      confirmText: '确定',
      confirmColor: '#1AAD19',
      success: (res) => {
        const { confirm, cancel } = res;
        if (confirm) {
          const bookId = this.data.bookInfo.id;
          wx.request({
            url: buyBookUrl,
            method: 'POST',
            data: {
              bookid: bookId,
              skey: app.getLoginFlag()
            },
            success: (res) => {
              const { code, msg } = res.data
              if (!code) {
                // 将按钮置为“打开”
                this.setData({
                  is_buy: 1
                })
                let ubalance = app.globalData.userInfo.ubalance;
                app.globalData.userInfo.ubalance = ubalance - 1;
                wx.setStorageSync('userInfo', JSON.stringify(app.globalData.userInfo));
                this.showInfo('购买成功', 'success');
              } else {
                this.showInfo(msg)
              }
            },
            fail: (error) => {
              console.log(error);
              this.showInfo('请求失败');
            }
          });
        } else if (cancel) {
          // 取消
        }
      }
    });
  },
  // 阅读书籍
  readBook() {
    let fileUrl = this.data.bookInfo.file;
    let key = 'book_' + this.data.bookInfo.id;
    // 书籍是否已下载过
    let downloadPath = app.getDownloadPath(key);
    if (downloadPath) {
      app.openBook(downloadPath);
      return;
    }
    this.setData({
      downloading: true
    })
    const downloadTask = wx.downloadFile({
      url: fileUrl,
      success: (res) => {
        let filePath = res.tempFilePath
        this.setData({
          downloading: false
        });
        // 调用 wx.saveFile 将下载的文件保存在本地
        app.saveDownloadPath(key, filePath)
          .then(function (saveFilePath) {
            app.openBook(saveFilePath);
          })
          .catch(function () {
            app.showInfo('文件保存失败');
          });
      },
      fail: (error) => {
        this.showInfo('文档下载失败');
        console.log(error);
      }
    });
    downloadTask.onProgressUpdate((res) => {
      this.setData({
        downloading: true,
        downloadPercent: res.progress
      });
    });
  },
  /**
   * 从评论页面返回时，需要刷新评论
   */
  onShow: function () {
    if (wx.getStorageSync('isFromBack')) {
      wx.removeStorageSync('isFromBack')
      this.getMoreInfo();
    }
  }
})