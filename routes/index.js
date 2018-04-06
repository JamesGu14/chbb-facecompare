'use strict'

const fs = require('fs')
const express = require('express')
const router = express.Router()
const path = require('path')
const uuidv1 = require('uuid/v1')
const faceService = require('../services/faceService')
const config = require('config')
const baiduConfig = config.get('baiduConfig')
const CELEBRITY_MALE_TEST_GROUPID = baiduConfig.CELEBRITY_MALE_TEST_GROUPID
const CELEBRITY_FEMALE_TEST_GROUPID = baiduConfig.CELEBRITY_FEMALE_TEST_GROUPID

const multer = require('multer')
const upload = multer({
  dest: 'public/faces/upload'
})

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' })
})

/** Find similar celebrity */
router.post('/compare', upload.single('avatar'), function(req, res) {

  var maxSize = 10 * 1000 * 1000  // Max 10mb for now
  if (req.file.size > maxSize) {
    return res.json({
      success: false,
      error: '文件大小超过10MB'
    })
  }
  let gender = req.body.gender
  let filename = req.file.filename
  let filepath = req.file.path
  let newname = 'img-' + uuidv1() + '.png'
  let newpath = filepath.replace(filename, newname)

  fs.renameSync(filepath, newpath)

  let detectRes = {}
  let similarRes = {}
  let result = {}
  faceService.detect(newpath)
    .then((resObj) => {
      detectRes = resObj
      result.face = resObj
      if (!gender || gender.length == 0) {
        gender = resObj[0].gender
      }
      let groupId = ''
      if (gender == 'male' || gender == 'm') {
        groupId = 'celebrity_male_test'
      } else if (gender == 'female' || gender == 'f') {
        groupId = 'celebrity_female_test'
      }
      
      return faceService.searchSimilar(newpath, groupId)
    })
    .then((resObj) => faceService.findImageByUid(resObj))
    .then((resObj) => {
      result.celebrities = resObj
      res.json(result)
    })
    .catch((err) => {
      res.json(err)
    })
})

module.exports = router
