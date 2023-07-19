import postgres from 'postgres'
import {drizzle} from 'drizzle-orm/postgres-js'
export {opalDb, quartzDb, uniqueDb} from './schemas'

import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
dotenvExpand.expand(dotenv.config())

const cache = {
  client: null as postgres.Sql | null,
  db: null as ReturnType<typeof drizzle> | null,
}

export const getDb = () => {
  if (cache.db) {
    return cache.db
  }
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw Error(`DATABASE_URL not defined.`)
  }

  cache.client = postgres(connectionString)
  cache.db = drizzle(cache.client)
  return cache.db
}

export const disconnectFromDb = async () => {
  if (cache.client) {
    await cache.client.end()
  }
  cache.client = null
  cache.db = null
}
