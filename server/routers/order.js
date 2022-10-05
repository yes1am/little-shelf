const express = require('express')
const router = express.Router()
const query = require('../mysql/query')

// 获取所有书籍
router.post('/buy', async (req, res) => {
  const { bookid, skey } = req.body || {}
  if(bookid === undefined || !bookid) {
    res.json({
      code: -1,
      msg: '缺少请求参数bookid字段，请检查后重试'
    });
    return;
  }
  if(skey === undefined || !skey) {
    res.json({
      code: -1,
      msg: '缺少请求参数skey字段，请检查后重试'
    });
    return;
  }
  try {
    // 查询书籍价格
    const bookRes = await query(`select bkprice from books where bkid=?`, bookid)
    const bkprice = bookRes && bookRes[0] && bookRes[0].bkprice
    if(!bkprice) {
      res.json({
        code: 1,
        msg: '书籍信息出错'
      })
    } else {
      // 查询用户余额
      const userRes = await query(`select ubalance,openid from users where skey=?`, skey)
      if(userRes && userRes[0] && !isNaN(userRes[0].ubalance) && userRes[0].openid) {
        // 购买的起
        if(Number(userRes[0].ubalance) >= bkprice) {
          await query(`insert into orders (openid,oprice,bkid) VALUES (?,?,?)`, [userRes[0].openid, bkprice, bookid])
          await query(`update users set ubalance=? where openid=?`, [userRes[0].ubalance - bkprice, userRes[0].openid])
          res.json({
            code: 0,
          })
        } else {
          res.json({
            code: 1,
            msg: '用户余额不足'
          })
        }
      } else {
        res.json({
          code: 1,
          msg: '用户信息出错'
        })
      }
    }
  } catch (error) {
    res.json({
      code: 1,
      msg: error.message || '系统出错，请稍后重试'
    })
  }
})

module.exports = router