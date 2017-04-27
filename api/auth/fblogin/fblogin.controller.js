const FB = require('fb')
const Promise = require('bluebird')
const httpStatus = require('http-status')
const errorCode = require('../../../helpers/errorCode')
const APIError = require('../../../helpers/APIError')
const config = require('pitch-config')
// const User = require('pitch-database/models').User

const FIELDS = [
  'id',
  'link',
  'first_name',
  'last_name',
  'gender',
  'locale',
  'email',   // permission: email
  'birthday' // permission: user_birthday
]

function getProfile (fb) {
  return new Promise((resolve, reject) => {
    fb.api('/me', { fields: FIELDS }, (profile) => {
      if (profile && profile.error) {
        return reject(profile.error)
      }

      if (profile.hasOwnProperty('email') === false) {
        return reject(new APIError(
          errorCode[errorCode.FBLOGIN_MISSING_GRANT_EMAIL],
          httpStatus.BAD_REQUEST,
          errorCode.FBLOGIN_MISSING_GRANT_EMAIL
        ))
      }

      if (profile.hasOwnProperty('birthday') === false) {
        return reject(new APIError(
          errorCode[errorCode.FBLOGIN_MISSING_GRANT_BIRTHDAY],
          httpStatus.BAD_REQUEST,
          errorCode.FBLOGIN_MISSING_GRANT_BIRTHDAY
        ))
      }

      return resolve(profile)
    })
  })
}

function getFriends (fb) {
  return new Promise((resolve, reject) => {
    fb.api('/me/friends', (friends) => {
      if (friends && friends.error) {
        return reject(friends.error)
      }

      if (friends.hasOwnProperty('summary') === false) {
        return reject(new APIError(
          errorCode[errorCode.FBLOGIN_MISSING_GRANT_FRIENDS],
          httpStatus.BAD_REQUEST,
          errorCode.FBLOGIN_MISSING_GRANT_FRIENDS
        ))
      }

      return resolve(friends)
    })
  })
}

function createUser (req, res, next) {
  return (data) => {
    const profile = data[0]
    // const friends = data[1]
    res.json(profile)
  }
}

function FacebookLogin (req, res, next) {
  const fb = new FB.Facebook({
    version: config.app.facebook.version,
    appSecret: config.app.facebook.appSecret,
    accessToken: req.body.accessToken
  })

  const promises = [
    getProfile(fb),
    getFriends(fb)
  ]

  Promise.all(promises).then(createUser(req, res, next), (err) => next(err))
}

module.exports = FacebookLogin
