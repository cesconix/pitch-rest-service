const jwt = require('jsonwebtoken')
const config = require('pitch-config')

const signToken = (uid) => {
  const { secret, jwtExpirationTime } = config.app
  return jwt.sign({ uid }, secret, { expiresIn: jwtExpirationTime })
}

module.exports = { signToken }
