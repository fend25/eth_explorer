CREATE TABLE IF NOT EXISTS "opal_event" (
	"event_synthetic_id" serial PRIMARY KEY NOT NULL,
	"block_number" bigint,
	"block_hash" char(64),
	"block_timestamp" bigint,
	"extrinsic_synthetic_id" bigint,
	"extrinsic_index" smallint,
	"extrinsic_hash" char(64),
	"ethereum_hash" char(64),
	"event_index" smallint,
	"metadata_version" smallint,
	"event_section" varchar(255),
	"event_name" varchar(255),
	"address_originator" varchar(64),
	"address_from" varchar(64),
	"address_from_is_ethereum" boolean,
	"address_to" varchar(64),
	"address_to_is_ethereum" boolean,
	"collection_id_from" bigint,
	"collection_id_to" bigint,
	"token_id_from" bigint,
	"token_id_to" bigint,
	"token_parts_amount" bigint,
	"event_data" jsonb,
	"is_parsed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "opal_substrate_block_raw" (
	"block_number" bigint,
	"block_hash" char(66),
	"block_timestamp" timestamp with time zone,
	"block_info" jsonb,
	"extrinsics" jsonb,
	"events" jsonb,
	"block_raw_json" jsonb,
	"block_raw_human" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quartz_event" (
	"event_synthetic_id" serial PRIMARY KEY NOT NULL,
	"block_number" bigint,
	"block_hash" char(64),
	"block_timestamp" bigint,
	"extrinsic_synthetic_id" bigint,
	"extrinsic_index" smallint,
	"extrinsic_hash" char(64),
	"ethereum_hash" char(64),
	"event_index" smallint,
	"metadata_version" smallint,
	"event_section" varchar(255),
	"event_name" varchar(255),
	"address_originator" varchar(64),
	"address_from" varchar(64),
	"address_from_is_ethereum" boolean,
	"address_to" varchar(64),
	"address_to_is_ethereum" boolean,
	"collection_id_from" bigint,
	"collection_id_to" bigint,
	"token_id_from" bigint,
	"token_id_to" bigint,
	"token_parts_amount" bigint,
	"event_data" jsonb,
	"is_parsed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quartz_substrate_block_raw" (
	"block_number" bigint,
	"block_hash" char(66),
	"block_timestamp" timestamp with time zone,
	"block_info" jsonb,
	"extrinsics" jsonb,
	"events" jsonb,
	"block_raw_json" jsonb,
	"block_raw_human" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "unique_event" (
	"event_synthetic_id" serial PRIMARY KEY NOT NULL,
	"block_number" bigint,
	"block_hash" char(64),
	"block_timestamp" bigint,
	"extrinsic_synthetic_id" bigint,
	"extrinsic_index" smallint,
	"extrinsic_hash" char(64),
	"ethereum_hash" char(64),
	"event_index" smallint,
	"metadata_version" smallint,
	"event_section" varchar(255),
	"event_name" varchar(255),
	"address_originator" varchar(64),
	"address_from" varchar(64),
	"address_from_is_ethereum" boolean,
	"address_to" varchar(64),
	"address_to_is_ethereum" boolean,
	"collection_id_from" bigint,
	"collection_id_to" bigint,
	"token_id_from" bigint,
	"token_id_to" bigint,
	"token_parts_amount" bigint,
	"event_data" jsonb,
	"is_parsed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "unique_substrate_block_raw" (
	"block_number" bigint,
	"block_hash" char(66),
	"block_timestamp" timestamp with time zone,
	"block_info" jsonb,
	"extrinsics" jsonb,
	"events" jsonb,
	"block_raw_json" jsonb,
	"block_raw_human" jsonb
);
