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
const common = require('../util/common')
const knex = require('../db/connection')

const detect = (imagePath) => {

  return new Promise(function (resolve, reject) {

    let faceClient = new AipFaceClient(APP_NAME, APP_KEY, APP_SECRET)
    let stream = common.base64Encode(imagePath)

    var options = {
      'max_face_num': '2',
      'face_fields': 'age,beauty,expression,faceshape,gender,glasses,landmark,race,qualities'
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

const searchSimilar = (imagePath, groupId) => {

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
        console.log(`Detected face: ${f.uid}, confidence: ${f.scores[0]}`)
        uidArr.push({
          uid: f.uid,
          confidence: f.scores[0]
        })
      })

      resolve(uidArr)

    }).catch((err) => {

      console.log(err)
      reject(err)
    })
  })
}

const updateUser = (uid, userInfo, imgPath, gender) => {

  return new Promise(function(resolve, reject) {

    if (!imgPath || imgPath.length <= 1) {
      return resolve()
    }

    let groupId = CELEBRITY_MALE_TEST_GROUPID
    if (gender === 'F') {
      groupId = CELEBRITY_FEMALE_TEST_GROUPID
    }

    let faceClient = new AipFaceClient(APP_NAME, APP_KEY, APP_SECRET)
    let stream = common.base64Encode(imgPath)
    
    var options = {
      'action_type': 'replace'
    }

    faceClient.updateUser(uid, userInfo, groupId, stream, options).then(function(result) {
      
      console.log(`Face saves succeed - ${JSON.stringify(result)}`)
      resolve(result)
    }).catch(function(err) {
      // 如果发生网络错误
      console.log(err);
      reject(err)
    })
  })
}

const getUsers = () => {

  return new Promise(function(resolve, reject) {
    
    knex('celebrity').select('*').then((faces) => {

      resolve(faces)
    }).catch(function(err) {
      console.log(err)
      reject(err)
    })
  })
}

const findImageByUid = (uidList) => {

  return new Promise((resolve, reject) => {

    knex('celebrityImage')
      .join('celebrity', 'celebrityImage.celebrity_id', '=', 'celebrity.id')
      .whereIn('celebrityImage.uid', _.map(uidList, 'uid'))
      .then((rows) => {

        uidList.forEach(u => {

          _.assign(u, _.find(rows, { uid: u.uid }))
        })
        resolve(uidList)
      })
  })
}


module.exports = {
  detect,
  searchSimilar,
  getUsers,
  updateUser,
  findImageByUid
}