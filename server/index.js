const express = require('express')
const app = express()
const port = 3000
const booksRouter = require('./routers/book')
const loginRouter = require('./routers/login')
const userRouter = require('./routers/user')
const orderRouter = require('./routers/order')
const commentRouter = require('./routers/comment')

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/login', loginRouter)

app.use('/api/books', booksRouter)

app.use('/api/user', userRouter)

app.use('/api/order', orderRouter)

app.use('/api/comment', commentRouter)

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})