const express = require('express')
const router = express.Router()
const query = require('../mysql/query')

// 获取已购书籍
router.get('/getBoughtBooks', async (req, res) => {
  const { skey } = req.query
  if(!skey) {
    res.json({
      code: 1,
      msg: '缺少 skey 参数，请检查后重试'
    })
    return
  }
  const books = await query(`select books.bkid,bkname,bkfile,bkcover from books right join orders on books.bkid=orders.bkid right join users on users.openid=orders.openid where users.skey=?`, skey);
  res.json({
    code: 0,
    data: books.filter(({bkid, bkname, bkfile, bkcover})=> {
      return bkid && bkname && bkfile && bkcover
    })
  })
})

module.exports = router