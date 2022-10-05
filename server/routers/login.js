const axios = require('axios')
const { appConfig, userConfig } = require('../config/app')
const { encryptSha1, decryptByAES } = require('../utils')
const query = require('../mysql/query')
const dayjs = require('dayjs')

/**
 * 获取当前用户session_key
 * @param {*用户临时登录凭证} code 
 * @param {*小程序appid} appid 
 * @param {*小程序密钥} appSecret 
 */
async function getSessionKey(code) {
  const { appid, secret } = appConfig;
  const result = {
    code: 0,
    msg: '',
    data: {}
  }
  try {
    const res = await axios({
      method: 'GET',
      url: 'https://api.weixin.qq.com/sns/jscode2session',
      params: {
        appid: appid,
        secret: secret,
        js_code: code,
        grant_type: 'authorization_code'
      }
    })
    const { data } = res || {}
    const { openid, session_key, errcode, errmsg } = data;
    if (!openid || !session_key || errcode) {
      result.code = 1;
      result.msg = errmsg || '返回数据字段不完整'
    } else {
      result.data = data
    }
  } catch (error) {
    console.log(`getSessionKey 请求出错`)
    result.code = 1;
    result.msg = 'getSessionKey 请求出错'
  }
  return result
}

// 保存用户信息
async function saveUserInfo({userInfo, session_key, skey }) {
  const { openId } = userInfo;
  try {
    const userExist = await query(`select * from users where openid="${openId}"`)
    const currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
    let resUserInfo = {}
    if(userExist.length) {
      // console.log("openId", openId, skey, session_key)
      // 已经存在该用户了，则更新
      await query(`update users set ? where openid=?`, [{
        'uname': userInfo.nickName,
        'ugender': userInfo.gender,
        'uaddress': userInfo.province + ',' + userInfo.country,
        'update_time': currentTime,
        'skey': skey,
        'sessionkey': session_key,
        'uavatar': userInfo.avatarUrl
      }, openId])
      resUserInfo = {
        ...userInfo,
        ubalance: userExist[0].ubalance
      }
    } else {
    // 新增用户
      await query(`insert into users set ?`, {
        'openid': openId,
        'uname': userInfo.nickName,
        'ugender': userInfo.gender,
        'uaddress': userInfo.province+','+userInfo.country,
        'ubalance': userConfig.credit,
        'uavatar': userInfo.avatarUrl,
        'skey': skey,
        'sessionkey': session_key,
        'create_time': currentTime,
        'update_time': currentTime
      })
      resUserInfo = {
        ...userInfo,
        ubalance: userConfig.credit
      }
    }
    // 不返回敏感信息
    delete resUserInfo.openId && delete resUserInfo.watermark;
    return {
      code: 0,
      userInfo: resUserInfo,
      skey
    }
  } catch (error) {
    return {
      code: 1,
      msg: `saveUserInfo 错误: ${error.message}`
    }
  }
}

module.exports = async (req, res) => {
  const { code, encryptedData, iv } = req.query;
  try {
    if([code, encryptedData, iv].some(item => !item)) {
      res.json({
        code: 1,
        msg: '缺少参数字段，请检查后重试'
      })
      return
    }
    const { code: resCode, data: resData, msg } = await getSessionKey(code)
    if(resCode) {
      res.json({
        code: resCode,
        msg
      })
      return
    }
    const { session_key, } = resData
    // 加密 session_key 作为登录态标识
    const skey = encryptSha1(session_key);
    // 从加密信息中获取用户信息
    const userInfo = JSON.parse(decryptByAES(encryptedData, session_key, iv));
    console.log("解密出的用户信息:", userInfo)
    // 存入用户数据表中
    const response = await saveUserInfo({userInfo, session_key, skey })
    res.json(response)
  } catch (error) {
    res.json({
      code: 1,
      msg: error.message || '服务出错，请稍后重试'
    })
  }
}