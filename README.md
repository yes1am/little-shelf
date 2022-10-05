## 学习微信小程序开发

学习《小书架》课程：https://github.com/SuperJolly/wxapp-little-shelf

## 1. 如何运行

1. 新建本地数据库取名 wxapp，执行 server/wxapp.sql 文件生成数据表
2. 将 AppID 和 AppSecret 填入到 server/config/app.js 中
```js
appConfig: {
  appid: '填写小程序 AppID',
  secret: '填写小程序 AppSecret'
}
```
3. 运行服务端：cd server && npm install && npm start
4. 使用微信开发者工具打开 client 目录

## 2. 学到了什么？

1. 如何实现小程序登录
2. 如何进行页面跳转传参：url 携带参数
3. ...