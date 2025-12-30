const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = generateToken;
