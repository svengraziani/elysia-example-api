import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'

// Define the Book model as a reusable reference
const BookModel = new Elysia().model({'Book': t.Object({
    id: t.String({ description: 'The unique identifier of the book' }),
    title: t.String({ description: 'The title of the book' }),
    author: t.String({ description: 'The author of the book' }),
    publishedDate: t.String({ description: 'The publication date of the book' }),
    isbn: t.String({ description: 'The ISBN number of the book' }),
})});

// Initialize Elysia app
const app = new Elysia()
    .use(BookModel)
    .use(swagger()) // Automatically generate Swagger/OpenAPI docs

    // Get all books
    .get('/books', ({ store }) => store.books, {
        detail: {
            summary: 'Get all books',
            description: 'Retrieve a list of all books available in the store.',
            response: 'Book', // Use the Book model reference
        },
    })

    // Get a book by ID
    .get('/books/:id', ({ params, store }) => {
        const book = store.books.find(book => book.id === params.id)
        if (!book) throw new Error('Book not found')
        return book
    }, {
        detail: {
            summary: 'Get a book by ID',
            description: 'Retrieve details of a book by its unique ID.',
            params: t.Object({
                id: t.String(),
            }),
            response: 'Book', // Use the Book model reference
        },
    })

    // Add a new book
    .post('/books', ({ body, store }) => {
        const newBook = { id: String(Date.now()), ...body }
        store.books.push(newBook)
        return newBook
    }, {
        detail: {
            summary: 'Add a new book',
            description: 'Add a new book to the bookstore.',
        },
    })

    // Update a book by ID
    .put('/books/:id', ({ params, body, store }) => {
        const bookIndex = store.books.findIndex(book => book.id === params.id)
        if (bookIndex === -1) throw new Error('Book not found')

        store.books[bookIndex] = { ...store.books[bookIndex], ...body }
        return store.books[bookIndex]
    }, {
        detail: {
            summary: 'Update a book by ID',
            description: 'Update the details of an existing book by its ID.',
        },
    })

    // Delete a book by ID
    .delete('/books/:id', ({ params, store }) => {
        const bookIndex = store.books.findIndex(book => book.id === params.id)
        if (bookIndex === -1) throw new Error('Book not found')

        const deletedBook = store.books.splice(bookIndex, 1)
        return deletedBook[0]
    }, {
        detail: {
            summary: 'Delete a book by ID',
            description: 'Remove a book from the bookstore by its ID.',
            params: t.Object({
                id: t.String(),
            }),
            response: 'Book', // Use the Book model reference
        },
    })

    // Middleware to store books
    .state('books', [
        { id: '1', title: '1984', author: 'George Orwell', publishedDate: '1949-06-08', isbn: '9780451524935' },
        { id: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', publishedDate: '1960-07-11', isbn: '9780060935467' }
    ])

    .listen(3000, () => {
        console.log('Server started on http://localhost:3000')
    })

export type App = typeof app