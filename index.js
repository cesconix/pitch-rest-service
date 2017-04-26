const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const cors = require('cors')
const httpStatus = require('http-status')
const ev = require('express-validation')

const config = require('pitch-config')
const database = require('pitch-database')
const APIError = require('./helpers/APIError')
const api = require('./api')

const app = express()

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(helmet())
app.use(cors())

app.use('/api', api)

app.use((req, res, next) => {
  const err = new APIError('API not found', httpStatus.NOT_FOUND)
  return next(err)
})

app.use((err, req, res, next) => {
  if (err instanceof ev.ValidationError) {
    const unifiedErrorMessage = 'Validation Error: ' + err.errors.map(error => error.messages.join('. ')).join(' and ')
    const error = new APIError(unifiedErrorMessage, err.status)
    return next(error)
  } else if (!(err instanceof APIError)) {
    const apiError = new APIError(err.message, err.status)
    return next(apiError)
  }
  return next(err)
})

app.use((err, req, res, next) => {
  res.status(err.status).json({
    status: err.status,
    message: err.message
  })
})

database.connect()

app.listen(config.rest.port)

module.exports = app
