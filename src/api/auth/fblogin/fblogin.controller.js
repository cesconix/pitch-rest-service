const FB = require('fb')
const Promise = require('bluebird')

const httpStatus = require('http-status')
const errorCode = require('helpers/errorCode')
const APIError = require('helpers/APIError')

const config = require('pitch-config')
const { User } = require('pitch-database/models')

const { getProfile, getFriends, updateUserProfile } = require('./fblogin.helpers')

const fields = [
  'id',
  'link',
  'first_name',
  'last_name',
  'gender',
  'locale',
  'email',   // permission: email
  'birthday' // permission: user_birthday
]

function createUser (req, res, next) {
  return (data) => {
    const profile = data[0]
    const friends = data[1]

    if (friends.summary.total_count <= config.app.minimumFriendsToSignup) {
      const code = errorCode.FBLOGIN_MINIMUM_FRIENDS_NOT_REACHED
      const err = new APIError(errorCode[code], httpStatus.BAD_REQUEST, code)
      return next(err)
    }

    User.findOne({ 'provider.id': profile.id }).exec((err, user) => {
      if (err) {
        const err = new APIError('internal server error', httpStatus.INTERNAL_SERVER_ERROR)
        return next(err)
      }

      if (user == null) {
        user = new User()
        user.random = Math.random()
        user.provider = { name: 'facebook', id: profile.id, link: profile.link }
      }

      user.profile = updateUserProfile(profile)

      user.save()
        .then(savedUser => res.json(savedUser))
        .catch(e => next(e))
    })
  }
}

function FacebookLogin (req, res, next) {
  const fb = new FB.Facebook({
    version: config.app.facebook.version,
    appSecret: config.app.facebook.appSecret,
    accessToken: req.body.accessToken
  })

  const promises = [
    getProfile(fb, fields),
    getFriends(fb)
  ]

  Promise.all(promises).then(
    createUser(req, res, next),
    (err) => next(new APIError(
      err.message,
      httpStatus.BAD_REQUEST
    ))
  )
}

module.exports = FacebookLogin
