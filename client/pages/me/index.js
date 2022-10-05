// pages/me.js
// 获取 app 实例
const app = getApp();

Page({
  data: {
    userInfo: {},
    hasLogin: wx.getStorageSync('loginFlag') ? true : false
  },
  // 生命周期函数--监听页面加载
  onLoad() {
    this.checkLoginStatus();
  },
  // 执行登录
  doLogin() {
    wx.showLoading({
      title: '登录中...',
      mask: true
    });
    app.doLogin(this.getUserInfo);
  },
  // 检查本地 storage 是否有登录态标识
  checkLoginStatus() {
    const loginFlag = wx.getStorageSync('loginFlag');
    if (loginFlag) {
      // 检查 session_key 是否过期
      wx.checkSession({
        // session 有效
        success: () => {
          this.getUserInfo()
        },
        // session_key 已过期
        fail: function () {
          this.setData({
            hasLogin: false
          });
        }
      })
    } else {
      this.setData({
        hasLogin: false
      })
    }
  },
  // 从 globalData 中获取 userInfo
  getUserInfo() {
    const userInfo = app.globalData.userInfo;
    console.log('userInfo 是', userInfo);
    if (userInfo) {
      this.setData({
        hasLogin: true,
        userInfo: userInfo
      });
      wx.hideLoading();
    } else {
      console.log('globalData中userInfo为空');
    }
  },
  // 跳转我的已购书籍页面
  goMyBooks() {
    wx.navigateTo({
      url: '../myBooks/index'
    });
  }
})