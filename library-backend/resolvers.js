const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()
const DataLoader = require('dataloader')

const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

const bookLoader = new DataLoader(async (authorIds) => {
  const books = await Book.find({ author: { $in: authorIds } })
  const booksByAuthor = authorIds.map((authorId) =>
    books.filter((book) => book.author.toString() === authorId.toString())
  )
  return booksByAuthor
})

const resolvers = {
  Query: {
    bookCount: async () => {
      console.log('Book.colection.countDocuments')
      return Book.collection.countDocuments()
    },
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.genre) {
        return Book.find({genres: args.genre})
      }
      return Book.find({})
    },
    allAuthors: async (root, args) => {
      console.log('Author.find')
      return Author.find({}).populate('books')
    },
    me: (root, args, context) => {
      return context.currentUser
    },
  },
  Book: {
    author: async (root) => {
      const author = await Author.findById(root.author)
      return {
        id: author.id,
        name: author.name,
        born: author.born
      }
    }
  },

  Author: {
    bookCount: async (root) => {
      const authorsBooks = await bookLoader.load(root.id)
      return authorsBooks.length
    },
    books: async (root) => {
      const authorsBooks = await bookLoader.load(root.id)
      return authorsBooks
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }

      const existingBook = await Book.findOne({ title: args.title });
      if (existingBook) {
        throw new GraphQLError('Title must be unique', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title
          }
        })
      }
      if (args.title.length<4) {
        throw new GraphQLError('Title field must be at least five characters', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title
          }
        })
      }
      if (args.author.length<4) {
        throw new GraphQLError('Author field must be at least four characters', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.author
          }
        })
      }
      let author = await Author.findOne({ name: args.author })

      if (!author) {
        author = await new Author({ name: args.author }).save()
      }

      const book = new Book({ ...args, author: author })
      await book.save()

      pubsub.publish('BOOK_ADDED', { bookAdded: book })

      return book
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }

      const author = await Author.findOne({ name: args.name })
      author.born = args.setBornTo
      await author.save()
      return author
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })

      return user.save()
        .catch(error => {
          throw new GraphQLError('Creating the user failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
              error
            }
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if ( !user || args.password !== 'secret' ) {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
    },
  },
}

module.exports = resolvers