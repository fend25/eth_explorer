import type { Config } from 'drizzle-kit'

import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
dotenvExpand.expand(dotenv.config())

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw Error(`DATABASE_URL not defined.`)
}

export default {
  schema: './dal/_schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString,
  }
} satisfies Config
