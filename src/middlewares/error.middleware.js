const logger = require('../utils/logger')

const errorMiddleware = (err, req, res, next) => {
    logger.error(`[ERROR] ${req.method} ${req.url}: ${err.message}`);
    
    const isDev = process.env.NODE_ENV === 'development';
    
    res.status(err.status || 500).json({
        message: isDev ? err.message : 'An unexpected error occurred. Please try again later.',
        stack: isDev ? err.stack : undefined
    });
}

module.exports = errorMiddleware