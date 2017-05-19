const _ = require('lodash')
const axios = require('axios')
const Promise = require('bluebird')
const httpStatus = require('http-status')
const APIError = require('helpers/APIError')

const getProfile = (fb, fields) => {
  return new Promise((resolve, reject) => {
    fb.api('/me', { fields }, (profile) => {
      if (profile && profile.error) {
        return reject(profile.error)
      }

      if (profile.hasOwnProperty('email') === false) {
        const error = new APIError(
          'The user does not grant the "user_email" permission',
          httpStatus.BAD_REQUEST
        )
        return reject(error)
      }

      if (profile.hasOwnProperty('birthday') === false) {
        const err = new APIError(
          'The user does not grant the "user_birthday" permission',
          httpStatus.BAD_REQUEST
        )
        return reject(err)
      }

      return resolve(profile)
    })
  })
}

const getFriends = (fb) => {
  return new Promise((resolve, reject) => {
    fb.api('/me/friends?limit=1', (res) => {
      if (res && res.error) {
        return reject(res.error)
      }

      if (res.hasOwnProperty('summary') === false) {
        const error = new APIError(
          'The user does not grant the "user_friends" permission',
          httpStatus.BAD_REQUEST
        )
        return reject(error)
      }

      const totalCount = res.summary.total_count

      if (res.paging && res.paging.next) {
        return getFriendsRecursively(res.paging.next, [], (error, data) => {
          if (error) {
            return reject(error)
          }

          return resolve({ data: _.map(data, 'id'), totalCount })
        })
      }

      return resolve({ data: _.map(res.data, 'id'), totalCount })
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
    birthday: new Date(facebookProfile.birthday)
  }
}

const getFriendsRecursively = (next, friends, cb) => {
  axios.get(next)
    .then((res) => {
      res = res.data
      friends = friends.concat(res.data)
      if (res.paging && res.paging.next) {
        getFriendsRecursively(res.paging.next, friends, cb)
      } else {
        cb(null, friends)
      }
    })
    .catch((error) => cb(error, null))
}

module.exports = { getProfile, getFriends, updateUserProfile }
