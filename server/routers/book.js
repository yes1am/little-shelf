const dayjs = require('dayjs');
const express = require('express')
const router = express.Router()
const query = require('../mysql/query')

// 获取所有书籍
router.get('/getAllBooks', async (req, res) => {
  const books = await query(`select * from books`);
  res.json({
    code: 0,
    data: books
  })
})

// 根据用户skey标识，查询用户是否购买书籍并返回评论列表
router.get('/queryBook', async (req, res) => {
  const { bookid, skey } = req.query
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
    let is_buy = 0
    const userOrders = await query('select * from orders left join users on users.openid=orders.openid where users.skey=? and orders.bkid=?', [skey, bookid])
    if(userOrders.length) {
      is_buy = 1
    } else {
      is_buy = 0
    }
    let comments = await query('select * from comment where bkid=?', [bookid])
    comments = comments.map((item) => {
      return {
        ...item,
        ctime: dayjs(item.ctime).format('YYYY-MM-DD HH:mm:ss')
      }
    }) || []
    res.json({
      code: 0,
      data: {
        is_buy,
        comments
      }
    })
  } catch (error) {
    res.json({
      code: 1,
      msg: error.message || '系统出错，请稍后重试'
    })
    return
  }
})

module.exports = router