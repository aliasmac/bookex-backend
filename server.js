require('dotenv').config()
require('./db/mongoose')

const express = require('express')
const cors = require('cors')
const port = process.env.PORT || 3000
const app = express()

const books = require('./routes/book-routes')
const users = require('./routes/user-routes')
const loans = require('./routes/loan-routes')
const { User } = require('./models/user')
const { Loan } = require('./models/loan')
const { Book } = require('./models/book')

// const corsOptions = { origin: 'http://FRONT-END-URL.herokuapp.com' }
// corsOptions to be uncommented and passed to cors() if front-end deployed

app.use(cors())
app.use(express.json())

app.use((error, request, response, next) => {
  if (error instanceof SyntaxError) {
    return response.status(400).send({ data: "Data formatted incorrectly" })
  } else {
    next()
  }
})

const authenticate = (request, response, next) => {
  let token = request.header('authorization')
  User.findByToken(token).then(user => {
    if (!user) {
      return Promise.reject()
    }
    request.user = user
    request.token = token
    next()
  }).catch(err => response.status(401).send())
}

app.post('/loans', authenticate, loans.post)
app.get('/loans', authenticate, loans.get)
app.get('/loans/:id', authenticate, loans.getByBook)
app.delete('/loan/:id', authenticate, loans.delete)

app.get('/books', books.get)
app.get('/books/popular', books.popular)
app.get('/books/suggestions', books.suggestions)

app.post('/users', users.post)
app.get('/users/profile', authenticate, users.get)
app.patch('/users/profile', authenticate, users.patch)
app.post('/users/login', users.login)
app.post('/users/logout', authenticate, users.logout)

app.listen(port, () => console.log(`Server listening on port ${port}.`))
