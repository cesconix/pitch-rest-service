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

      if (!profile.hasOwnProperty('email')) {
        return reject(new APIError(
          'The user does not grant the "user_email" permission',
          httpStatus.BAD_REQUEST
        ))
      }

      if (!profile.hasOwnProperty('birthday')) {
        return reject(new APIError(
          'The user does not grant the "user_birthday" permission',
          httpStatus.BAD_REQUEST
        ))
      }

      return resolve(profile)
    })
  })
}

const getFriends = (fb) => {
  return new Promise((resolve, reject) => {
    fb.api('/me/friends', (res) => {
      if (res && res.error) {
        return reject(res.error)
      }

      if (!res.hasOwnProperty('summary')) {
        return reject(new APIError(
          'The user does not grant the "user_friends" permission',
          httpStatus.BAD_REQUEST
        ))
      }

      const totalCount = res.summary.total_count

      if (res.paging && res.paging.next) {
        return getFriendsRecursively(res.paging.next, [], (error, data) => {
          error ? reject(error) : resolve({ data, totalCount })
        })
      }

      return resolve({ data: res.data, totalCount })
    })
  })
}

const updateProfile = (facebookProfile) => {
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

module.exports = { getProfile, getFriends, updateProfile }
