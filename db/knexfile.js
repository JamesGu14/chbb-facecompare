// Update with your config settings.

module.exports = {

  development: {
    client: 'mysql',
    connection: {
      host: 'localhost',
      database: 'chbb_facecompare_dev',
      user:     'root',
      password: 'root'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  staging: {
    client: 'mysql',
    connection: {
      host: '106.14.7.201',
      database: 'wtms_face_stg',
      user:     'wtmsdev',
      password: '2018GoGo!'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'mysql',
    connection: {
      host: '106.14.7.201',
      database: 'wtms_face',
      user:     'root',
      password: 'root'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
