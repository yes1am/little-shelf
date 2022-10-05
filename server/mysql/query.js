const mysql = require('mysql');
const config = require('../config/db').mysql;

// 创建数据库连接池
const pool = mysql.createPool(config);

// 通过连接池执行数据CRUD操作
module.exports = function (sqlString, params) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err)
      } else {
        connection.query(sqlString, params, (err, rows) => {
          if (err) {
            reject(err)
          } else {
            resolve(rows)
          }
          connection.release()
        })
      }
    })
  })
}