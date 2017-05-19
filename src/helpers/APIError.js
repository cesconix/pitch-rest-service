const httpStatus = require('http-status')

class APIError extends Error {
  constructor (message, status = httpStatus.INTERNAL_SERVER_ERROR) {
    super(message)
    this.status = status
    this.message = message
    Error.captureStackTrace(this, this.constructor.name)
  }
}

module.exports = APIError
