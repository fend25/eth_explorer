import {gt, gte, not, sql, notInArray, SQL, desc} from 'drizzle-orm'
import {PgDialect} from 'drizzle-orm/pg-core'
import {disconnectFromDb, getDb, opalDb} from "../dal/_config/connection";

const pgDialect = new PgDialect()

Error.stackTraceLimit = 1000

const RPC_URL = process.env.RPC_OPAL
const WS_URL = process.env.WS_OPAL
if (!RPC_URL || !WS_URL) {
  throw new Error('No RPC_* or WS_* env variables provided')
}

const main = async () => {
  const db = getDb()
  const eventTable = opalDb.event
  const rawDataTable = opalDb.substrateBlockRaw

  const lastBlockDbResult = await db.select()
    .from(rawDataTable)
    .orderBy(desc(rawDataTable.blockNumber))
    .limit(1)
    .execute()

  const lastBlock = lastBlockDbResult[0]
  if (!lastBlock) {
    throw new Error('No last block')
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
}).finally(async () => {
  await Promise.all([
    disconnectFromDb(),
  ])
})
