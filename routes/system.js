'use strict'

const express = require('express')
const router = express.Router()
const multer = require('multer');
const upload = multer({ dest: 'public/faces/group/user' })
const uuidv1 = require('uuid/v1')
const fs = require('fs')
const faceService = require('../services/faceService')
const pinyin = require('pinyin')
const knex = require('../db/connection.js')
const config = require('config')
const programConfig = config.get('programConfig')
const _ = require('lodash')

router.get('/', function(req, res) {
  
  faceService.getUsers().then((users) => {

    res.render('system', {
      'title': '后台管理',
      'users': users
    })
  })
})

router.post('/face', upload.array('avatar', 2), function(req, res) {

  var maxSize = 2 * 1000 * 1000 // 2mb max
  if (req.files.length !== 1 && req.files.length !== 2) {
    return res.send('需要上传1-2张照片')
  }
  
  req.files.forEach(f => {
    if (f.size > maxSize) {
      return res.send('上传失败，文件超过2MB')
    }
  })

  let filename = req.file.filename
  let filepath = req.file.path
  let newname = 'img-' + uuidv1() + '.png'
  let newpath = filepath.replace(filename, newname)
  let personName = req.body.personName

  fs.renameSync(filepath, newpath)

  faceService.detect(newpath).then((result) => {

    if (result.length !== 1) {
      return res.json({
        'status': 'fail',
        'message': 'Nothing or more than one faces detected'
      })
    }

    if (result[0].age > programConfig.ageThreshold) {
      return res.json({
        'status': 'fail',
        'message': 'Are you sure this kid is less than 10 years old?'
      })
    }

    let uid = pinyin(personName, {
      style: pinyin.STYLE_NORMAL
    })

    uid = _.flattenDeep(uid).join('')
    let newUid = ''

    // Save to db
    knex('child')
      .returning('id')
      .insert({
        fullName: personName,
        imgPath: newpath,
        uid: ''
      })
      .then((id) => {
        
        newUid = `${uid}_${id}`
        knex('child').update({
          uid: newUid
        })
        .where({ id: id })
        .then(() => {
          
          faceService.updateUser(newUid, personName, newpath).then(() => {
            res.send('上传成功')
          })
        })
      })
  })
})

module.exports = router