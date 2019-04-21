const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LoanSchema = new Schema({
      location: {
        type: String
      }, book: {
        type: Schema.Types.ObjectId,
        ref: 'Book'
      }, user: {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
})

const Loan = mongoose.model('Loan', LoanSchema)

module.exports = { Loan }