const FacebookLogin = (req, res) => {
  res.send(req.body)
}

module.exports = FacebookLogin

// const UserModel = require('pitch-database/models').User
// const express = require('express')
// const config = require('../../config')
// // const UserModel = require('../../models/user')
// const app = express()
//
// const FB = require('fb')
//
// const fb = new FB.Facebook({version: 'v2.8', appSecret: 'e58902af1378a9e45e033e21a4aff5f6'})
// fb.setAccessToken('EAAaoS2a2hicBAErbpi85dFVwF6wIGx9sFIfHl7IgJQcFyQbXGvEh29ZCJ4PZBQUPwVZB8GoSk2ZAMBclttAWSJHILHAiNFXQ0Olb5eiWrxuHZBUZA0qWA2zcaFAowzbKGxvFrIlFwwY7VsKOnmAJYEtkGUAHqc40SZBJy4ZA8FBXCZA6UcNRvfw1c')
//
// // first_name    : profile.first_name
// // last_name     : profile.last_name
// // gender        : profile.gender
// // locale        : profile.locale
// // email         : profile.email
// // birthday      : profile.birthday
// // interested_in : if profile.interested_in then profile.interested_in else []
// // location      : if profile.location and profile.location.name then profile.location.name else null
//
// const fields = [
//   'first_name',
//   'last_name',
//   'gender',
//   'email',
//   'birthday',
//   'interested_in',
//   'location',
//   'link'
// ]
//
// // fb.api('/me', { fields }, (res) => {
// //   if (res && res.error) {
// //     if (res.error.code === 'ETIMEDOUT') {
// //       console.log('request timeout')
// //     } else {
// //       console.log('error', res.error)
// //     }
// //   } else {
// //     console.log(res)
// //   }
// // })
//
// fb.api('/me/friends', (res) => {
//   if (res && res.error) {
//     if (res.error.code === 'ETIMEDOUT') {
//       console.log('request timeout')
//     } else {
//       console.log('error', res.error)
//     }
//   } else {
//     console.log(res)
//   }
// })
//
// app.listen(config.system.services.rest.port, () => {})
