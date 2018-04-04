'use strict'

exports.up = function(knex, Promise) {
  
  return knex.schema.createTable('celebrity', (table) => {

    table.increments()
    table.string('name', 100).notNullable()
    table.string('gender', 1).notNullable()
    table.dateTime('dob')
    table.string('job', 100)
    table.string('nationality', 50)
    table.string('birthplace', 50)
    table.text('desc')
  })
}

exports.down = function(knex, Promise) {
  
  return knex.schema.dropTable('celebrity')
}
