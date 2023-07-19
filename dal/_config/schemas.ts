import {pgSchema, pgTable} from 'drizzle-orm/pg-core'
import {substrateBlockRawTableColumns} from '../substrate_block_raw'
import {eventTableColumns} from "../substrate_event";

export const opal_substrateBlockRaw = pgTable('opal_substrate_block_raw', substrateBlockRawTableColumns)
export const opal_event = pgTable('opal_event', eventTableColumns)
export const opalDb = {
  substrateBlockRaw: opal_substrateBlockRaw,
  event: opal_event,
}

export const quartz_substrateBlockRaw = pgTable('quartz_substrate_block_raw', substrateBlockRawTableColumns)
export const quartz_event = pgTable('quartz_event', eventTableColumns)
export const quartzDb = {
  substrateBlockRaw: quartz_substrateBlockRaw,
  event: quartz_event,
}

export const unique_substrateBlockRaw = pgTable('unique_substrate_block_raw', substrateBlockRawTableColumns)
export const unique_event = pgTable('unique_event', eventTableColumns)
export const uniqueDb = {
  substrateBlockRaw: unique_substrateBlockRaw,
  event: unique_event,
}
