import {drizzle} from 'drizzle-orm/postgres-js'
import {migrate} from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import DrizzleConfig from '../drizzle.config'

const sql = postgres(DrizzleConfig.dbCredentials.connectionString, {max: 1})
const db = drizzle(sql)

const main = async () => {
  await migrate(db, {migrationsFolder: "drizzle",})
  await sql.end()
}
main().catch((error) => {
  console.error(error)
  process.exit(1)
})

