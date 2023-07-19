import type { Config } from 'drizzle-kit'
import './dal/_config/connection' // to run dotenv

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw Error(`DATABASE_URL not defined.`)
}

export default {
  schema: './dal/_config/schemas.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString,
  }
} satisfies Config
