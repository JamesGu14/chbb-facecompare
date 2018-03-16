'use strict'

exports.up = function(knex, Promise) {
  
  return knex.schema.createTable('celebrity', (table) => {

    table.increments()
    table.string('name', 100).notNullable()
    table.dateTime('dob')
    table.string('gender', 1).notNullable()
    table.string('desc', 255)
    table.string('imagePath', 255)
    table.string('youngImagePath', 255)
    table.string('uid', 100)
  })
}

exports.down = function(knex, Promise) {
  
  return knex.schema.dropTable('celebrity')
}
