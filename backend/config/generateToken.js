const jwt = require('jsonwebtoken')
const generateToken = (id) => {
    return jwt.sign({id}, 'abhishek', {
        expiresIn: "30d",
    })
}

module.exports = generateToken;