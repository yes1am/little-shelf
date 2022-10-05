import { loginUrl } from './config/api'
// app.js
App({
  // 小程序启动
  onLaunch() {
    // 检查登录状态
    this.checkLoginStatus()
  },
  // 检查本地 storage 中是否有登录态标识
  checkLoginStatus() {
    const loginFlag = wx.getStorageSync('loginFlag');
    if (loginFlag) {
      // 如果有登录态标识，则检查 session_key 是否过期
      wx.checkSession({
        success: (res) => {
          // 直接从 Storage 中获取用户信息
          const userStorageInfo = wx.getStorageSync('userInfo')
          if (userStorageInfo) {
            this.globalData.userInfo = JSON.parse(userStorageInfo)
          } else {
            this.showInfo('缓存信息缺失')
            console.error('登录成功后将用户信息存在Storage的userStorageInfo字段中，该字段丢失');
          }
        },
        // session_key 过期
        fail: () => {
          this.doLogin()
        }
      })
    } else {
      // 无登录态
      this.doLogin()
    }
  },
  // 进行登录，参考: https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html 
  doLogin(callback) {
    wx.login({
      success: (loginRes) => {
        const { code } = loginRes
        if (code) {
          // 拿到 code 之后，先询问用户获取用户基础信息，然后进行登录
          wx.getUserInfo({
            withCredentials: true,
            success: (infoRes) => {
              const { rawData, signature, encryptedData, iv } = infoRes
              console.log(infoRes)
              wx.request({
                url: loginUrl,
                data: {
                  code,
                  rawData,  // 用户非敏感信息
                  signature,  // 签名
                  encryptedData,  // 用户敏感信息
                  iv  // 解密算法的向量
                },
                success: (res) => {
                  const { data } = res || {}
                  const { code, skey, userInfo, msg } = data;
                  if (!code) {
                    this.globalData.userInfo = userInfo;
                    wx.setStorageSync('userInfo', JSON.stringify(userInfo))
                    wx.setStorageSync('loginFlag', skey)
                    if (callback) {
                      callback()
                    }
                  } else {
                    this.showInfo(msg)
                  }
                },
                fail: () => {
                  this.showInfo('调用登录接口失败');
                }
              })
            },
            fail: () => {
              this.showInfo("获取用户信息失败")
            }
          })
        }
      }
    })
  },
  // 封装 wx.showToast 方法
  showInfo(info = 'error', icon = 'none') {
    wx.showToast({
      title: info,
      icon: icon,
      duration: 1500,
      mask: true
    });
  },
  // 获取用户登录标示 供全局调用
  getLoginFlag: function () {
    return wx.getStorageSync('loginFlag');
  },
  // 获取书籍已下载路径
  getDownloadPath: function (key) {
    return wx.getStorageSync(key);
  },
  // 调用 wx.saveFile 将下载的文件保存在本地
  saveDownloadPath: function (key, filePath) {
    return new Promise((resolve, reject) => {
      wx.saveFile({
        tempFilePath: filePath,
        success: function (res) {
          // 保存成功 在Storage中标记 下次不再下载
          let savedFilePath = res.savedFilePath;
          wx.setStorageSync(key, savedFilePath);
          resolve(savedFilePath);
        },
        fail: function () {
          reject(false);
        }
      });
    })
  },
  // 打开书籍
  openBook: function (filePath) {
    wx.openDocument({
      filePath: filePath,
      success: function (res) {
        console.log('打开文档成功')
      },
      fail: function (error) {
        console.log(error);
      }
    });
  },
  globalData: {
    userInfo: null
  }
})
