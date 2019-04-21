const _ = require('lodash')

const { User } = require('../models/user')
const { Book } = require('../models/book')

exports.get = (request, response) => {
  request.user.populate()
    .then(user => response.send({ user}))
}

exports.post = (request, response) => {
  let user = new User(request.body)
  user.save()
    .then(() => user.generateToken())
    .then(token => {
      response.header('Access-Control-Expose-Headers', 'authorization')
      response.header('authorization', token)
      return user.populate()
    }).then(user => response.send({ user }))
    .catch(err => response.status(400).send(err))
}

exports.patch = async (request, response) => {
  let body = _.pick(request.body, [
    'name',
    'location',
    'currently_reading',
    'favourite_books',
    'books_read',
    'wishlist'
  ])
  if (body.currently_reading) {
    await Book.createAndSetId(body.currently_reading)
  }
  await Book.findOrCreateBooksFromLists(body) 
  console.log('book creation done')
  User.findByIdAndUpdate(request.user.id, body, { new: true })
    .then(user => user.populate())
    .then(user => response.send({ user }))
    .catch(err => response.status(400).send())
}

exports.login = (request, response) => {
  User.findAndAuthenticate(request.body.username, request.body.password)
    .then(user => { 
        user.generateToken()
        .then(token => {
          response.header('Access-Control-Expose-Headers', 'authorization')
          response.header('authorization', token)
          return user.populate()
        })
        .then(user => response.send({ user }))
      }).catch(err => response.status(400).send())
}

exports.logout = (request, response) => {
  request.user.removeToken(request.token)
    .then(resp => response.status(200).send())
    .catch(resp => response.status(400).send())
}