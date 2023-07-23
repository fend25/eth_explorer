const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
dotenvExpand.expand(dotenv.config())

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error(new Error(`DATABASE_URL not defined.`))
  process.exit(1)
}

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const config = {
  production: {
    client: "postgresql",
    connection: connectionString,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  }
}

module.exports = config
