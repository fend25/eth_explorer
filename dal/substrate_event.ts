import {
  pgTable,
  serial,
  char,
  varchar,
  bigint as dBigint,
  smallint,
  jsonb,
  boolean,
  index, timestamp
} from "drizzle-orm/pg-core";

export const substrateEventTable = pgTable(
  'substrate_event',
  {
    eventSyntheticId: serial('event_synthetic_id').primaryKey(),
    isParsed: boolean('is_parsed').notNull().default(false),

    chainName: varchar('chain_name', {length: 32}),

    blockNumber: dBigint('block_number', {mode: 'number'}),
    blockHash: char('block_hash', {length: 64}),
    blockTimestamp: dBigint('block_timestamp', {mode: 'number'}),

    extrinsicSyntheticId: dBigint('extrinsic_synthetic_id', {mode: 'number'}),
    extrinsicIndex: smallint('extrinsic_index'),
    extrinsicHash: char('extrinsic_hash', {length: 64}),
    ethereumHash: char('ethereum_hash', {length: 64}),

    metadataVersion: smallint('metadata_version'),

    eventIndex: smallint('event_index'),
    eventSection: varchar('event_section', {length: 255}),
    eventMethod: varchar('event_section', {length: 255}),
    eventData: jsonb('event_data'),

    addressOriginator: varchar('address_originator', {length: 64}),
    addressFrom: varchar('address_from', {length: 64}),
    addressFromIsEthereum: boolean('address_from_is_ethereum'),
    addressTo: varchar('address_to', {length: 64}),
    addressToIsEthereum: boolean('address_to_is_ethereum'),

    collectionIdFrom: dBigint('collection_id_from', {mode: 'number'}),
    collectionIdTo: dBigint('collection_id_to', {mode: 'number'}),

    tokenIdFrom: dBigint('token_id_from', {mode: 'number'}),
    tokenIdTo: dBigint('token_id_to', {mode: 'number'}),
    tokenPartsAmount: dBigint('token_parts_amount', {mode: 'bigint'}),

    createdAt: timestamp('created_at', {withTimezone: true}).defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).defaultNow(),
  },
  (table) => {
    const tableName = 'substrate_event'
    return {
      blockNumberIdx: index(`${tableName}_block_number_idx`).on(table.blockNumber),
      timestampIdx: index(`${tableName}_timestamp_idx`).on(table.blockTimestamp),
      eventSectionAndMethodIdx: index(`${tableName}_event_section_and_method_idx`).on(table.eventSection, table.eventMethod),
    }
  }
)
