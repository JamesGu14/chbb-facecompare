'use strict'

const express = require('express')
const router = express.Router()
const multer = require('multer');
const upload = multer({
  dest: 'public/faces/group/user'
})
const uuidv1 = require('uuid/v1')
const fs = require('fs')
const faceService = require('../services/faceService')
const pinyin = require('pinyin')
const knex = require('../db/connection.js')

const _ = require('lodash')

router.get('/', function (req, res) {

  faceService.getUsers().then((users) => {

    res.render('system', {
      'title': '后台管理',
      'users': users
    })
  })
})

router.post('/face', upload.array('avatar'), function (req, res) {

  var maxSize = 2 * 1000 * 1000 // 2mb max
  if (req.files.length !== 1 && req.files.length !== 2) {
    return res.send('需要上传1-2张照片')
  }

  req.files.forEach(f => {
    if (f.size > maxSize) {
      return res.send('上传失败，文件超过2MB')
    }
  })

  let celebrityImage = req.files[0]

  let celebrityImageName = celebrityImage.filename
  let celebrityImagePath = celebrityImage.path
  let celebrityImageNewName = 'img-' + uuidv1() + '.png'
  let celebrityImageNewPath = celebrityImagePath.replace(celebrityImageName, celebrityImageNewName)

  // Rename celebrity Image
  fs.renameSync(celebrityImagePath, celebrityImageNewPath)

  let youthImageNewPath = ''
  if (req.files.length === 2) {
    let youthImage = req.files[1]

    let youthImageName = youthImage.filename
    let youthImagePath = youthImage.path
    let youthImageNewName = 'img-' + uuidv1() + '.png'
    youthImageNewPath = youthImagePath.replace(youthImageName, youthImageNewName)
    fs.renameSync(youthImagePath, youthImageNewPath)
  }

  let personName = req.body.personName
  let personDob = req.body.personDob
  let personGender = req.body.personGender
  let personDesc = req.body.personDesc

  let uid = pinyin(personName, {
    style: pinyin.STYLE_NORMAL
  })

  uid = _.flattenDeep(uid).join('')
  let newUid = ''

  // Save to db
  knex('celebrity')
    .returning('id')
    .insert({
      name: personName,
      dob: personDob,
      gender: personGender,
      imagePath: celebrityImageNewPath,
      youngImagePath: youthImageNewPath,
      desc: personDesc,
      uid: ''
    })
    .then((id) => {

      newUid = `${uid}_${id}`
      knex('celebrity').update({
          uid: newUid
        })
        .where({
          id: id
        })
        .then(() => {

          faceService.updateUser(newUid, personName, celebrityImageNewPath, personGender)
            .then(() => faceService.updateUser(newUid, personName, youthImageNewPath, personGender))
            .then(() => {
              res.send('上传成功')
            })
        })
    })
})

module.exports = router