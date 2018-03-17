'use strict'

const Promise = require('bluebird')
const _ = require('lodash')
const fs = require('fs')
const byline = require('byline')
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
const path = require('path')
const importFilePath = path.join(__dirname, '../temp/celebrity_male_list.csv')
var lineByLine = require('n-readlines');
var liner = new lineByLine(importFilePath);

function processLine(line) {
  return new Promise(resolve => {

    let count = 0;
    
    //console.log(line.split('').filter(c => c === ',').length)
    let slots = line.split(',')

    let gender = 'M'
    if (slots[2] === '女'){
      gender = 'F'
    }

    let newCelebrity = {
      name: slots[1],
      gender: gender,
      dob: slots[3].replace('年', '-').replace('月', '-'),
      desc: slots[7],
      
    }
    resolve()
  })
}

function importCelebrities() {

  return new Promise(async (resolve, reject) => {

    var line;
    var lineNumber = 0;
    while (line = liner.next()) {
      
      await processLine(line.toString())
      lineNumber++;
    }

    console.log('end of line reached, total: ' + lineNumber);
    resolve()
  })
}

module.exports = {
  importCelebrities,
}