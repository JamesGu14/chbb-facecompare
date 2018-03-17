'use strict'

const express = require('express')
const router = express.Router()
const path = require('path')
const faceService = require('../services/faceService')
const importService = require('../services/importService')
const config = require('config')
const baiduConfig = config.get('baiduConfig')
const CELEBRITY_MALE_TEST_GROUPID = baiduConfig.CELEBRITY_MALE_TEST_GROUPID
const CELEBRITY_FEMALE_TEST_GROUPID = baiduConfig.CELEBRITY_FEMALE_TEST_GROUPID

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' })
})

router.get('/import', function(req, res) {

  importService.importCelebrities().then(() => {
    res.send('finish')
  })
})

router.get('/test', function(req, res) {

  let imagePath = path.join(__dirname, '../public/faces/upload/test.png')

  faceService.identity(imagePath, CELEBRITY_MALE_TEST_GROUPID).then(() => {

    return res.json({
      success: true
    })
  }).catch(err => {
    return res.json({
      err: err
    })
  })
})

module.exports = router
