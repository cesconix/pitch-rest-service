const httpStatus = require('http-status')

class APIError extends Error {
  constructor (message, status = httpStatus.INTERNAL_SERVER_ERROR, code) {
    super(message)
    this.status = status
    this.message = message
    this.code = code
    Error.captureStackTrace(this, this.constructor.name)
  }
}

module.exports = APIError
