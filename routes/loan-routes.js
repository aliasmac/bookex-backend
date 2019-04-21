const {Loan} = require('../models/loan')
const {Book} = require('../models/book')

exports.get = (req, res) => {
  Loan.find()
    .populate('book')
    .populate('user')
    .exec()
    .then((loans) => {
      res.send({ loans })
    }, (e) => {
      res.status(400).send(e)
    })
}

// currently unused
exports.getByBook = (req, res) => {
  Loan.find({ book: req.params.id })
    .populate('book')
    .populate('user')
    .exec()
    .then((loans) => {
      res.send({ loans })
    }, (e) => {
      res.status(400).send(e)
    })
}

exports.post = async (req, res) => {
  await Book.createAndSetId(req.body.book)
  let loan = new Loan({
    book: req.body.book,
    user: req.user
  })
  loan.save()
    .then(doc => {
      res.send(doc)
    }, (e) => {
      res.status(400).send(e)
    })
}

exports.delete = (req, res) => {
  const id = req.params.id
  Loan.findById(id).then(loan => {
      if (!loan) {
      return res.status(404).send()
    } else if (loan.id !== req.user.id) {
      return res.status(401).send()
    } else {
        Loan.findByIdAndRemove(id).then((loan) => {
          res.send({ loan })
        })
    }
  }).catch(e => { res.status(400).send() })
}