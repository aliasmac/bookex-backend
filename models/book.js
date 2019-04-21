const mongoose = require('mongoose')
const _ = require('lodash')

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true
  }, author: {
    type: String,
  }, description: {
    type: String
  }, published_at: {
    type: String
  }, categories: [{
    type: String
  }], ISBN_13: {
    type: Number,
  }, google_id: {
    type: Number,
  }, image: {
    type: String
  }
})

class BookClass {

  static convertGoogleObject (obj) {
    return {
      title: _.get(obj, 'volumeInfo.title'),
      author: _.get(obj, 'volumeInfo.authors[0]'),
      description: _.get(obj, 'volumeInfo.description'),
      published_at: _.get(obj, 'volumeInfo.publishedDate'),
      categories: _.get(obj, 'volumeInfo.categories'),
      ISBN_13: _.get(obj, 'volumeInfo.industryIdentifiers[0].identifier'),
      image: _.get(obj, 'volumeInfo.imageLinks.thumbnail')
    }
  }


  static findOrCreateBooksFromLists(userObj) {
    const lists = ['wishlist', 'favourite_books', 'books_read']
    return Promise.all(
        lists.reduce((acc, key) =>
          acc.concat(userObj[key] && userObj[key].map(book =>  Book.createAndSetId(book))),
          []
        )
      )
  }

  static createAndSetId(book) {
    if (book._id) { return }
    if (!Book.ISBN_13) {
      let newBook = new Book(book)
      return newBook.save().then(dbBook => book._id = dbBook._id)
    }
    return Book.findOne({ISBN_13: parseInt(book.ISBN_13)})
      .then(foundBook => {
        if (!foundBook) {
          let newBook = new Book(book)
          return newBook.save().then(dbBook => book._id = dbBook._id)
        } 
        book._id = foundBook._id
      })
  }

  toJSON() {
    return _.pick(this, [
      'title',
      'author',
      'categories',
      'published_at',
      'ISBN_13',
      'description',
      'image',
      '_id'
    ])
  }

}

BookSchema.loadClass(BookClass)
const Book = mongoose.model('Book', BookSchema)

module.exports = { Book }