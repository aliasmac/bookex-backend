const fetch = require('node-fetch')
const {Book} = require('../models/book')

const api_key = process.env.GOOGLE_BOOKS_API
const books_url = 
  `https://www.googleapis.com/books/v1/volumes?key=${api_key}&maxResults=40&q=`

class BooksApi {

  static searchBooks(query, start=0) {
    return fetch(books_url + query + `&startIndex=${start}`)
      .then(resp => resp.json())
      .then(books =>
          books.items.map(Book.convertGoogleObject))
      .catch(err => console.log(err))
  }

}

module.exports={BooksApi}