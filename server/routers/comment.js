const dayjs = require('dayjs');
const express = require('express')
const router = express.Router()
const query = require('../mysql/query')

// 评论
router.post('/addComment', async (req, res) => {
  const { skey, content, bookid } = req.body;
  if(!skey || !content || !bookid) {
    res.json({
      code: 1,
      msg: '缺少必要参数'
    })
    return
  }
  try {
    const insertRes = await query(`insert into comment (openid,uname,uavatar,bkid,bkname,ccontent) select openid,uname,uavatar,?,(select bkname from books where bkid=?),? from users where users.skey=?`, [bookid, bookid, content, skey])
    if(insertRes.insertId) {
      res.json({
        code: 0,
      })
    } else {
      res.json({
        code: 1,
        msg: "插入数据失败"
      })
    }
  } catch (error) {
    res.json({
      code: 1,
      msg: error.message || '系统出错'
    })
  }
})

module.exports = router