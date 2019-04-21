# BookEx - Backend
Backend to a book search and exchange app - in Node.JS and Express, with MongoDB/Mongoose database connection.
Frontend found here: https://github.com/CiaranMn/bookex-frontend

## How it works for users
- On app load the home page displays a selection of books users have added to their favourites and wishlists, and on the right shows a leaderboard of books people are currently reading, and how many readers each has.
- Without being logged in, users can search for books, and click for more details.
- When logged in users can add books to their favourites or wishlist, indicate they are currently reading a book, and offer a book up for loan (or remove it from availability for loan)
- From the loan shelf page, users can see what books are available for loan, and click on any to see which user has it available.
- From their profile page, users can view and remove books on their wishlist and favourite lists.

## Backend Structure
The backend runs on Node.JS with Express handling RESTful requests (see routes section below). Mongoose is used to connect to a MongoDB database
###
`node server.js` to start the server.

### Key points
- **server.js** has middleware for authentification and catching incorrectly formatted JSON, and relies on functions imported from routes/ to handle requests.
- the db connection is made in **db/mongoose.js** with the schemas in **models/**
- **adapters/google-books.js** handles search requests by calling on the Google Books API.
- **models/books.js** takes the Google Books API results and picks required fields from them before they are passed to the frontend.
- books are only persisted to the database when a user saves them to one or more of: wishlist, favourite list, currently reading, loans.
- when the frontend makes a request to save books to a user, the user-routes file will call on the books model to find or create the books in the database.
- **models/user.js** deals with creating tokens for users and finding users by tokens, for authentification. they are sent back by user-routes.

# Server routes

**JSON Web Tokens (JWT) are used for user authentification.**
##
## Users

### POST /users
- expects a JSON object, requiring `username` and `password` keys, and optionally `location` (string), `currently_reading` (object), and three arrays of objects: `favourite_books`, `wishlist`, and `books_read`.
- if user creation is successful, returns a JSON object with a `user` key, the value of which is the user profile. There is an `authorization` key in the header with a JWT as its value. Will return an object with errmsg key if validation fails, e.g. due to username already taken.
- returns a 400 status if there are any errors. 

### GET /users/profile
- expects a header with key `authorization` and value equal to a valid JWT.
- returns the user profile inside a `user` key as JSON if the token is validated.
- returns a 401 status if the token is not verified as having originated from the server, is no longer present on the server, or relates to a user that cannot be found.

### PATCH /users/profile
- expects a JSON object with one or more valid user fields (except `username` and `password` which currently cannot be changed), along with an `authorization` key in the header with a JWT.
- will update the user record if the token is valid. Only specified fields will be changed - any not included in the request will be untouched.
- returns a 400 status if there are any errors.

### POST /users/login
- expects a JSON object and requires a `username` and `password` field.
- returns the user object with an `Authorization` key in the header with a JWT.
- returns a 400 status if the user is not found or if the password is incorrect.

### POST /users/logout
- expects a header with key `authorization` and value equal to a valid JWT.
- will delete the token from the user record on the server, so that even if someone has it, it cannot be used for authentification (tokens are matched against user records as well as being checked for a valid signature)

##
## Books

### GET /books
- expects a `q` parameter with a search term, and an optional `start` parameter to specify which record to start at.
- will return the first 40 results matching the search term, offsetting by the start value if given.
- will return a 400 status if there are any errors.

### GET /books/popular
- returns an array of objects representing all books which are recorded under the 'currently_reading' field for all users (currently unsorted and uncounted)

### GET /books/suggestions
- returns an array of objects representing a random 100 sample of books in the database (i.e. books which have ever been persisted due to users choosing them as favourites, wishlist, available for loan, or currently reading).

##
## Loans

**all routes require authentification via a 'authorization' key in the header with a valid JWT attached.**

### GET /loans
- returns an array of loans, each representing a user offering a specific book for loan, with the user information populated under a 'user' key and the book information populated under a 'book' key.

### GET /loans/:id
- the params.id represents a BOOK - this route returns all loans associated with a particular book (not currently used).

### POST /loans
- expects a JSON object with book object under the 'book' key (which will be found in the database or created if necessary, and reduced to an ObjectID). Creates a new loan associated with that book and the authenticated user.

### DELETE /loans/:id
- the params.id represents a LOAN - this record will be deleted, assuming the user authenticated by the token attached to the request matches the user in the loan record.
