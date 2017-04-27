const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const cors = require('cors')
const httpStatus = require('http-status')
const ev = require('express-validation')

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
  const { status, message, code, stack } = err
  const error = { status, message, stack }

  if (code) {
    error.code = code
  }

  res.status(200).json({ error })
})

module.exports = app
