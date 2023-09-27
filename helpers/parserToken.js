const jwt = require('jsonwebtoken')

const parserToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido' });
        }

        return decoded;
    });
}

module.exports = parserToken;