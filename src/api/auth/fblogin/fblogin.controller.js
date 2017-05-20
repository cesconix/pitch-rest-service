const _ = require('lodash')
const FB = require('fb')
const Promise = require('bluebird')

const httpStatus = require('http-status')
const APIError = require('helpers/APIError')
const { signToken } = require('helpers/auth')

const config = require('pitch-config')
const { User } = require('pitch-database/models')

const { getProfile, getFriends, updateProfile } = require('./fblogin.helpers')

function createUser (req, res, next) {
  return (data) => {
    const profile = data[0]
    const friends = data[1]

    if (friends.totalCount <= config.app.minimumFriendsToSignup) {
      return next(new APIError(
        'Minimum number of friends not reached',
        httpStatus.FORBIDDEN
      ))
    }

    User.findOne({ 'provider.id': profile.id }).exec((error, user) => {
      if (error) {
        return next(error)
      }

      if (user == null) {
        user = new User()
        user.random = Math.random()
        user.provider = {
          name: 'facebook',
          id: profile.id,
          link: profile.link
        }
        user.profile = {
          interestedIn: profile.gender === 'male' ? 'female' : 'male'
        }
      }

      user.provider.friends = _.map(friends.data, 'id')
      user.profile = Object.assign(user.profile, updateProfile(profile))

      user.save()
        .then(savedUser => {
          const token = signToken(savedUser.id)
          const { meta, profile } = savedUser.toObject()
          res.json({ user: { profile, meta }, token })
        })
        .catch(error => next(error))
    })
  }
}

function FacebookLogin (req, res, next) {
  const fb = new FB.Facebook({
    version: config.app.facebook.version,
    appSecret: config.app.facebook.appSecret,
    accessToken: req.body.accessToken
  })

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

  const promises = [
    getProfile(fb, fields),
    getFriends(fb)
  ]

  Promise.all(promises).then(
    createUser(req, res, next),
    (err) => next(err)
  )
}

module.exports = FacebookLogin
