const logger = require('../utils/logger')

const errorMiddleware = (err, req, res, next) => {
    logger.error(err.message)

    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong!',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    })
}

module.exports = errorMiddleware