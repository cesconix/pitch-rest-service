const FB = require('fb')
const Promise = require('bluebird')
const httpStatus = require('http-status')
const errorCode = require('../../../helpers/errorCode')
const APIError = require('../../../helpers/APIError')
const config = require('pitch-config')
const User = require('pitch-database/models').User

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
        const code = errorCode.FBLOGIN_MISSING_GRANT_EMAIL
        const err = new APIError(errorCode[code], httpStatus.BAD_REQUEST, code)
        return reject(err)
      }

      if (profile.hasOwnProperty('birthday') === false) {
        const code = errorCode.FBLOGIN_MISSING_GRANT_BIRTHDAY
        const err = new APIError(errorCode[code], httpStatus.BAD_REQUEST, code)
        return reject(err)
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
        const code = errorCode.FBLOGIN_MISSING_GRANT_FRIENDS
        const err = new APIError(errorCode[code], httpStatus.BAD_REQUEST, code)
        return reject(err)
      }

      return resolve(friends)
    })
  })
}

function updateUserProfile (facebookProfile) {
  return {
    firstName: facebookProfile.first_name,
    lastName: facebookProfile.last_name,
    gender: facebookProfile.gender,
    locale: facebookProfile.locale,
    email: facebookProfile.email,
    birthday: new Date(facebookProfile.birthday),
    interestedIn: facebookProfile.gender === 'male' ? 'female' : 'male'
  }
}

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
    getProfile(fb),
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
