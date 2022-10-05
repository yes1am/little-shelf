// pages/comment/index.js
import { commentUrl } from '../../config/api';
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    bookInfo: {},
    comment: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let bookInfo = {};
    for (let key in options) {
      bookInfo[key] = decodeURIComponent(options[key]);
    }
    this.setData({
      bookInfo: bookInfo
    });
  },
  handleInput(ev) {
    this.setData({
      comment: ev.detail.value
    });
  },
  showInfo: function (info, icon = 'none', callback = () => { }) {
    wx.showToast({
      title: info,
      icon: icon,
      duration: 1500,
      mask: true,
      success: callback
    });
  },
  /**
 *  检查用户是否输入了非法字符
 */
  checkIllegal: function (input) {
    let patern = /[`#^<>:"?{}\/;'[\]]/im;
    let _result = patern.test(input);
    return _result;
  },
  checkUserInput: function () {
    /*
     * 检测用户输入
     * 1. 是否包含非法字符
     * 2. 是否为空
     * 3. 是否超出长度限制
     */
    let comment = this.data.comment;
    let showToastFlag = false;
    let toastWording = '';

    if (!comment) {
      showToastFlag = true;
      toastWording = '输入不能为空';
    } else if (this.checkIllegal(comment)) {
      showToastFlag = true;
      toastWording = '含有非法字符';
    } else if (comment.length > 140) {
      showToastFlag = true;
      toastWording = '长度超出限制';
    }

    if (showToastFlag) {
      this.showInfo(toastWording);
      return false;
    } else {
      return true;
    }
  },
  // 提交评论
  handleSubmit(ev) {
    // 返回模板 id，用于发送模板消息: 2020年01月10日起，新发布的小程序将不能使用模板消息，请开发者迁移至订阅消息功能。
    // let formId = ev.detail.formId;
    if (this.checkUserInput()) {
      wx.request({
        url: commentUrl,
        method: 'POST',
        data: {
          skey: app.getLoginFlag(),
          content: this.data.comment,
          bookid: this.data.bookInfo.id,
          // formid: formId
        },
        success: (res) => {
          const { code, msg } = res.data || {}
          if (code) {
            this.showInfo(msg)
          } else {
            this.showInfo('评论成功', 'success', () => {
              wx.setStorageSync('isFromBack', '1');
              setTimeout(function () {
                wx.navigateBack({
                  delta: 1
                });
              }, 1500);
            })
          }
        },
        fail: function (error) {
          this.showInfo('请求失败');
        }
      });
    }
  }
})