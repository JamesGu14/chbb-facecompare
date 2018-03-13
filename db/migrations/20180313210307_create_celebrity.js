'use strict'

exports.up = function(knex, Promise) {
  
  return knex.schema.createTable('celebrity', (table) => {

    table.increments()
    table.string('name', 100).notNullable()
    table.string('gender', 1).notNullable()
    table.string('imagePath', 255)
    table.string('desc', 255)
  })
}

exports.down = function(knex, Promise) {
  
}
