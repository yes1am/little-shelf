/** index.js **/
const { getBoughtBooksUrl } = require('../../config/api');

// 获取app应用实例
const app = getApp();

Page({
  data: {
    books: [],
    loading: false,
    showDownloading: false,
    downloadPercent: 0
  },
  // 获取已购书籍
  getMybooks() {
    this.setData({
      loading: true
    })
    wx.request({
      url: getBoughtBooksUrl,
      data: {
        // 获取当前用户skey
        skey: app.getLoginFlag()
      },
      success: (res) => {
        const { code, data } = res.data || {}
        if (!code) {
          this.setData({
            books: data || [],
            loading: false
          });
        }
      },
      error: (err) => {
        console.log(err);
        this.setData({
          loading: false
        });
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMybooks();
  },
  readBook(ev) {
    let data = ev.currentTarget.dataset;
    let key = 'book_' + data.id;
    let fileUrl = data.file;
    // 如果已经下载过当前书 直接打开
    let downloadPath = app.getDownloadPath(key);
    if (downloadPath) {
      app.openBook(downloadPath);
      return;
    }
    this.setData({
      showDownloading: true
    })
    // 如果没有加载过当前书，开始下载
    const downloadTask = wx.downloadFile({
      url: fileUrl,
      success: (res) => {
        let filePath = res.tempFilePath;
        this.setData({
          showDownloading: false
        });
        // 下载后保存当前书籍文件路径
        app.saveDownloadPath(key, filePath)
          .then(function (saveFilePath) {
            app.openBook(saveFilePath);
          })
          .catch(function () {
            app.showInfo('文件保存失败');
          });
      },
      fail: (error) => {
        app.showInfo('文档下载失败');
        this.setData({
          showDownloading: false
        })
        console.log(error);
      }
    });
    // 监听当前文件下载进度
    downloadTask.onProgressUpdate((res) => {
      console.log('下载进度返回的res:', res);
      this.setData({
        downloadPercent: res.progress
      });
    });
  }
})