const Joi = require('joi')

module.exports = {
  body: {
    accessToken: Joi.string().required()
  }
}
