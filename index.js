require('app-module-path').addPath(`${__dirname}/src`)

const config = require('pitch-config')
const database = require('pitch-database')
const app = require('./src/index')

database.connect(config.database.uri)
app.listen(config.rest.port)
