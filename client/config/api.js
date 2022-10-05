// 服务器域名
const baseUrl = 'http://127.0.0.1:3000/';

// 登录 URL
export const loginUrl = baseUrl + 'api/login';

// 获取书籍信息接口地址(可选择全部或单个书籍)
export const getBooksUrl = baseUrl + 'api/books/getAllBooks';

// 获取当前用户已购买的书籍
export const getBoughtBooksUrl = baseUrl + 'api/user/getBoughtBooks';

// 查询书籍的评论和当前用户是否购买等信息
export const queryBookUrl = baseUrl + 'api/books/queryBook';

// 购买书籍
export const buyBookUrl = baseUrl + 'api/order/buy'

// 评论
export const commentUrl = baseUrl + 'api/comment/addComment'

