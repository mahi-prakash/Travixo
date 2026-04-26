require('dotenv').config()
const express = require('express')
const cors = require('cors')
const logger = require('./utils/logger')
const errorMiddleware = require('./middlewares/error.middleware')

const messageRoutes = require('./routes/messages.routes')


const app = express()
const PORT = process.env.PORT || 5000

// Middlewares — must come before routes
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/messages', messageRoutes)


// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Travstory Backend is running! 🚀' })
})

// Error middleware — always at the bottom
app.use(errorMiddleware)

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`)
})