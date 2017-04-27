const express = require('express')
const validate = require('express-validation')
const router = express.Router()

const FbLogin = require('./fblogin')

router.post('/fblogin', validate(FbLogin.schema), FbLogin.controller)

module.exports = router
