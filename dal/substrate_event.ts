import {pgTable, serial, text, char, varchar, bigint as dBigint, smallint, jsonb, boolean} from "drizzle-orm/pg-core";


/*
CREATE TABLE public.events (
    event_synthetic_id serial PRIMARY KEY,
    block_number bigint,
    block_hash character(64),
    block_timestamp timestamp with time zone,
    extrinsic_synthetic_id bigint,
    extrinsic_index smallint,
    extrinsic_hash character(64),
    event_index smallint,
    metadata_version smallint,
    event_section character varying(255),
    event_name character varying(255),
    address_originator character varying(255) NOT NULL,
    address_from character varying(64),
    address_from_is_ethereum boolean,
    address_to character varying(64),
    address_to_is_ethereum boolean,
    collection_id_from bigint,
    collection_id_to bigint,
    token_id_from bigint,
    token_id_to bigint,
    event_data jsonb,
    is_parsed boolean DEFAULT false NOT NULL,
    ethereum_hash character varying(64),
    token_parts_amount bigint
);
 */

export const Event = pgTable('event', {
  eventSyntheticId: serial('event_synthetic_id').primaryKey(),
  blockNumber: dBigint('block_number', { mode: 'number' }),
  blockHash: char('block_hash', { length: 64 }),
  blockTimestamp: dBigint('block_timestamp', { mode: 'number' }),
  extrinsicSyntheticId: dBigint('extrinsic_synthetic_id', { mode: 'number' }),
  extrinsicIndex: smallint('extrinsic_index'),
  extrinsicHash: char('extrinsic_hash', { length: 64 }),
  ethereumHash: char('ethereum_hash', { length: 64}),
  eventIndex: smallint('event_index'),
  metadataVersion: smallint('metadata_version'),
  eventSection: varchar('event_section', { length: 255 }),
  eventName: varchar('event_name', { length: 255 }),
  addressOriginator: varchar('address_originator', { length: 64 }),
  addressFrom: varchar('address_from', { length: 64 }),
  addressFromIsEthereum: boolean('address_from_is_ethereum'),
  addressTo: varchar('address_to', { length: 64 }),
  addressToIsEthereum: boolean('address_to_is_ethereum'),
  collectionIdFrom: dBigint('collection_id_from', { mode: 'number' }),
  collectionIdTo: dBigint('collection_id_to', { mode: 'number' }),
  tokenIdFrom: dBigint('token_id_from', { mode: 'number' }),
  tokenIdTo: dBigint('token_id_to', { mode: 'number' }),
  tokenPartsAmount: dBigint('token_parts_amount', { mode: 'bigint' }),
  eventData: jsonb('event_data'),
  isParsed: boolean('is_parsed').notNull().default(false),
})
