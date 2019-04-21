const mongoose = require('mongoose')
const Schema = mongoose.Schema
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const _ = require('lodash')

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username must be supplied'],
    unique: [true, 'Username is already taken'],
    trim: true
  }, password: {
    type: String,
    required: true,
  }, name: {
    type: String,
  }, location: {
    type: String
  }, currently_reading: {
    type: Schema.Types.ObjectId,
    ref: 'Book'
  }, favourite_books: [{
    type: Schema.Types.ObjectId,
    ref: 'Book'
  }], books_read: [{
    type: Schema.Types.ObjectId,
    ref: 'Book'
  }], wishlist: [{
    type: Schema.Types.ObjectId,
    ref: 'Book'
  }], tokens: [{
    type: String
  }]
})

UserSchema.pre('save', function (next) {
  let user = this
  if (user.isModified('password')) {
    bcrypt.genSalt(10)
      .then(salt => bcrypt.hash(user.password, salt))
      .then(hash => {
        user.password = hash
        next()
      })
  } else {
    next()
  }
})

class UserClass {

  generateToken() {
    let token = jwt.sign(
      {sub: this._id.toHexString()},
      process.env.SECRET)
    this.tokens.push(token)
    return this.save().then( () => token )
  }

  removeToken(token) {
    return this.update({
      $pull: { tokens: token }
    })
  }

  static findByToken(token) {
    let decoded
    try {
      decoded = jwt.verify(token, process.env.SECRET)
    } catch (err) {
      return Promise.reject()
    }
    return User.findOne({
      _id: decoded.sub,
      tokens: token
    })
  }

  static findAndAuthenticate(username, password) {
    return User.findOne({username})
      .then(user => {
        if (!user) { return Promise.reject() }
        return user.authenticate(password).then(resp => {
          if (resp) { return user }
        })
      })
  }

  authenticate(password) {
    return bcrypt.compare(password, this.password)
  }

  populate() {
    return User.findById(this.id)
      .populate('currently_reading', '-__v')
      .populate('favourite_books', '-__v')
      .populate('books_read', '-__v')
      .populate('wishlist', '-__v')
      .exec()      
  }

  toJSON() {
    return _.pick(this.toObject(), [
      'username',
      'name',
      'location',
      'currently_reading',
      'favourite_books',
      'books_read',
      'wishlist',
      '_id'
    ]);
  }

}

UserSchema.loadClass(UserClass)
const User = mongoose.model('User', UserSchema)

module.exports = { User }