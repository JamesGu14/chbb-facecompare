'use strict'

const Promise = require('bluebird')
const _ = require('lodash')
const AipFaceClient = require('baidu-aip-sdk').face
const config = require('config')
const baiduConfig = config.get('baiduConfig')
const APP_NAME = baiduConfig.APP_NAME
const APP_KEY = baiduConfig.APP_KEY
const APP_SECRET = baiduConfig.APP_SECRET
const CELEBRITY_MALE_TEST_GROUPID = baiduConfig.CELEBRITY_MALE_TEST_GROUPID
const CELEBRITY_FEMALE_TEST_GROUPID = baiduConfig.CELEBRITY_FEMALE_TEST_GROUPID
const knex = require('../db/connection.js')
const common = require('../util/common')

function detect(imagePath) {

  return new Promise(function (resolve, reject) {

    let faceClient = new AipFaceClient(APP_NAME, APP_KEY, APP_SECRET)
    let stream = common.base64Encode(imagePath)

    var options = {
      'max_face_num': '2',
      'face_fields': 'age,beauty,gender,qualities'
    }

    faceClient.detect(stream, options).then(function (result) {

      if (result.result === null) {
        reject()
      }
      resolve(result.result)
    }).catch(function (err) {
      console.log(err)
      reject(err)
    })
  })
}

function identity(imagePath, groupId) {

  return new Promise(function (resolve, reject) {

    let faceClient = new AipFaceClient(APP_NAME, APP_KEY, APP_SECRET)
    let stream = common.base64Encode(imagePath)

    var options = {
      'ext_fields': 'faceliveness',
      'user_top_num': 5
    }

    faceClient.identifyUser(groupId, stream, options).then(function (result) {

      if (!result.result || result.result.length <= 0) {
        console.log('No faces detected')
        return reject()
      }

      let faces = _.filter(result.result, function (u) {
        return u.scores.length > 0 && u.scores[0] > 0
      })

      if (faces.length <= 0) {
        console.log('No faces matching over 0%')
        return reject()
      }

      let uidArr = []
      faces.forEach(f => {
        console.log('Detected face: ' + f.uid + '')
        console.log(`Detected face: ${f.uid}, confidence: ${f.scores[0]}`)
        uidArr.push(f.uid)
      })

    }).catch((err) => {

      console.log(err)
      reject(err)
    })
  })
}


module.exports = {
  detect: detect,
  identity: identity
}