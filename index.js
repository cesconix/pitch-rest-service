const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const cors = require('cors')
const routes = require('./routes')
const config = require('./config')

const app = express()

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(helmet())
app.use(cors())

app.use('/api', routes)

app.listen(config.port)

module.exports = app
