const express = require('express')
const validate = require('express-validation')
const router = express.Router()

const FbLogin = require('./fblogin')

router.post('/fblogin', validate(FbLogin.schema), FbLogin.controller)

// const multer = require('multer')
// const upload = multer({ dest: 'uploads/' })
// router.post('/upload', upload.single('file'), (req, res, next) => {
//   console.log(req.file)
// })

module.exports = router
