const Promise = require('bluebird')
const httpStatus = require('http-status')
const errorCode = require('helpers/errorCode')
const APIError = require('helpers/APIError')

const getProfile = (fb, fields) => {
  return new Promise((resolve, reject) => {
    fb.api('/me', { fields }, (profile) => {
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

const getFriends = (fb) => {
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

const updateUserProfile = (facebookProfile) => {
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

module.exports = { getProfile, getFriends, updateUserProfile }
