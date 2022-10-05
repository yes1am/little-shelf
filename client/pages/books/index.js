// index.js
import { getBooksUrl } from '../../config/api'

// 获取应用实例
const app = getApp()

Page({
  data: {
    books: [],
    // 是否展示面板指示点,
    showIndicatorDots: false,
    // 滑动动画时长
    duration: 500,
    // 是否加载中
    loading: false,
    // 幻灯片前后间隔 
    sideMargin: '100rpx',
    // 是否采用衔接滑动
    circular: true,
    // 轮播间隔
    interval: 5000,
    // 是否自动播放轮播
    autoplay: false,
  },
  // 跳转书籍详情页
  goDetail(ev) {
    const dataset = ev.currentTarget.dataset;
    let navigateUrl = '../bookDetail/index?';
    for (let key in dataset) {
      dataset[key] = encodeURIComponent(dataset[key]);
      navigateUrl += key + '=' + dataset[key] + '&';
    }
    navigateUrl = navigateUrl.substring(0, navigateUrl.length - 1);
    wx.navigateTo({
      url: navigateUrl
    });
  },
  // 获取所有书籍
  getAllBooks() {
    this.setData({
      loading: true
    })
    wx.request({
      url: getBooksUrl,
      data: {
      },
      success: res => {
        const resData = res.data;
        const { code, data } = resData || {}
        if (code === 0) {
          setTimeout(() => {
            this.setData({
              books: data,
              loading: false
            });
          }, 800);
        }
      },
      error: function (err) {
        console.log("获取书籍列表错误", err);
      }
    });
  },
  onLoad() {
    this.getAllBooks()
  },
})
