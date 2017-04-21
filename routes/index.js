const express = require('express')
const router = express.Router()

const FacebookLogin = require('./facebookLogin')

router.use('/facebookLogin', FacebookLogin)

module.exports = router
