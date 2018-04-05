
exports.up = function(knex, Promise) {
  
  return knex.schema.createTable('celebrityImage', (table) => {

    table.increments()
    table.integer('celebrity_id').unsigned()
    table.foreign('celebrity_id').references('celebrity.id')
    table.boolean('isYoung').notNullable().defaultTo(false)
    table.string('imagePath', 255)
    table.string('uid', 100)
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('celebrityImage')
}
