const express = require('express');

// Error handling middleware
// This middleware should be used after all other routes and middlewares
const errorHandlingMiddleware = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: {
            message: message,
            status: statusCode,
        },
    });
};

module.exports = errorHandlingMiddleware;