const { BooksApi } = require('../adapters/google-books')
const { Book } = require('../models/book')
const { User } = require('../models/user')

exports.get = (request, response) => {
  let { query } = request
  if (query.q) {
    let start = query.start || 0
    BooksApi.searchBooks(query.q, start)
      .then(resp => response.send(resp))
  } else {
    response.status(400).send()
  }
}

exports.popular = (request, response) => {
  User.aggregate([ 
      { $match: {
        'currently_reading': { $exists: true }
      }},
      { $group: {
        _id: '$currently_reading',
        readers: { $sum: 1 }
      }},
      { $sort: 
        { readers: -1 }
      }, {
        $project: {
          _id: 0,
          book: '$_id',
          readers: 1
        }
      }
    ])
    .exec()
    .then(agg => 
      Book.populate(agg, { path: 'book'}))
    .then(resp => response.send(resp))
}

exports.suggestions = (request, response) => {
  Book
    .aggregate([
    { $sample: { size: 100 } }
  ])
  .exec()
  .then(books => response.send(books))
}
