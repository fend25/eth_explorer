import {
  timestamp,
  char,
  varchar,
  bigint as dBigint,
  jsonb, pgTable, PgTableExtraConfig, index, uniqueIndex,
} from 'drizzle-orm/pg-core'

export const substrateBlockTable = pgTable(
  'substrate_block',
  {
    chainName: varchar('chain_name', {length: 32}),
    blockNumber: dBigint('block_number', {mode: 'number'}),
    blockHash: char('block_hash', {length: 66}).primaryKey(),
    blockTimestamp: timestamp('block_timestamp', {withTimezone: true}),
    blockInfo: jsonb('block_info'),
    extrinsics: jsonb('extrinsics'),
    events: jsonb('events'),
    createdAt: timestamp('created_at', {withTimezone: true}).defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).defaultNow(),
  },
  (table): PgTableExtraConfig =>{
    const tableName = 'substrate_block'
    return {
      timestampIdx: index(`${tableName}_timestamp_idx`).on(table.blockTimestamp),
      blockNumberIdx: uniqueIndex(`${tableName}_block_number_idx`).on(table.blockNumber),
    }
  }
)


import knexFn, {Knex} from 'knex'
//@ts-ignore
import knexConfig from '../knexfile.js'

const knex = knexFn(knexConfig)
const publicSchema = knex.schema.withSchema('public')
const opalSchema = knex.schema.withSchema('opal')
const quartzSchema = knex.schema.withSchema('quartz')
const uniqueSchema = knex.schema.withSchema('unique')

const addColumns = {
  createdAtUpdatedAt: (table: Knex.CreateTableBuilder) => {
    table.datetime('created_at', {useTz: true}).notNullable().defaultTo(knex.fn.now())
    table.datetime('updated_at', {useTz: true}).notNullable().defaultTo(knex.fn.now())
  },
  chainName: (table: Knex.CreateTableBuilder) => {
    table.string('chain_name', 32).notNullable()
      .references('chain_name')
      .inTable('public.chain')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE')
  }
}

publicSchema.createTable('chain', table => {
  table.string('chain_name', 32).notNullable().primary()
})

const createSubstrateBlock = (schemaName: string, schema: Knex.SchemaBuilder) => {
  schema.createTable('substrate_block', table => {
    addColumns.chainName(table)

    table.integer('block_number').notNullable().unique()
    table.string('block_hash', 66).notNullable().primary()
    table.timestamp('block_timestamp', {useTz: true}).notNullable().index()

    table.jsonb('block_info').notNullable()
    table.jsonb('extrinsics').notNullable()
    table.jsonb('events').notNullable()

    addColumns.createdAtUpdatedAt(table)
  })
}

createSubstrateBlock('opal', opalSchema)
createSubstrateBlock('quartz', quartzSchema)
createSubstrateBlock('unique', uniqueSchema)

