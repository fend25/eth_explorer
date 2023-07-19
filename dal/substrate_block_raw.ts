import {
  timestamp,
  char,
  varchar,
  bigint as dBigint,
  jsonb,
} from 'drizzle-orm/pg-core'

export const substrateBlockRawTableColumns = {
  blockNumber: dBigint('block_number', {mode: 'number'}),
  blockHash: char('block_hash', {length: 66}),
  blockTimestamp: timestamp('block_timestamp', {withTimezone: true}),
  blockInfo: jsonb('block_info'),
  extrinsics: jsonb('extrinsics'),
  events: jsonb('events'),
  blockRawJson: jsonb('block_raw_json'),
  blockRawHuman: jsonb('block_raw_human'),
}
