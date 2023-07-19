import {gt, gte, not, sql, notInArray, SQL} from "drizzle-orm";

Error.stackTraceLimit = 1000

import axios from 'axios'
import * as fs from 'fs'

import {ApiPromise, WsProvider} from '@polkadot/api'

import {SubstrateEvent, SubstrateExtrinsic, SubstrateBlockResult} from "./types/substrate";
import {disconnectFromDb, getDb, opalDb} from "../dal/_config/connection";

const RPC_URL = process.env.RPC_OPAL
const WS_URL = process.env.WS_OPAL
if (!RPC_URL || !WS_URL) {
  throw new Error('No RPC_* or WS_* env variables provided')
}

const cache = {
  api: null as ApiPromise | null,
}

const connect = async () => {
  if (cache.api && cache.api.isConnected) {
    return cache.api
  }

  const provider = new WsProvider(WS_URL)
  cache.api = await ApiPromise.create({provider})//, rpc: {unique: opalDefinitions.unique.rpc,}})
  await cache.api.isReady

  return cache.api
}

import { ScProvider } from '@polkadot/rpc-provider/substrate-connect'
import * as Sc from '@substrate/connect'
import {WellKnownChain} from '@substrate/connect'

import OpalCustomSpec from './chain_specs/opal.json'
import QuartzCustomSpec from './chain_specs/quartz.json'
import UniqueCustomSpec from './chain_specs/unique.json'

const connectToLightNode = async () => {
  if (cache.api && cache.api.isConnected) {
    return cache.api
  }
  const spec = QuartzCustomSpec
  const relayChain = new ScProvider(Sc, WellKnownChain.ksmcc3)
  const provider = new ScProvider(Sc, JSON.stringify(spec), relayChain)

  const startTime = Date.now()
  console.log(`${new Date().toLocaleTimeString()} Connecting to ${spec.name}...`)
  await relayChain.connect()
  await provider.connect()
  console.log(`${new Date().toLocaleTimeString()} Connected to ${spec.name} in ${(Date.now() - startTime)/1000}s`)

  console.log(`${new Date().toLocaleTimeString()} Creating API...`)
  cache.api = await ApiPromise.create({provider})//, rpc: {unique: opalDefinitions.unique.rpc,}})
  console.log(`${new Date().toLocaleTimeString()} API created`)

  console.log(`${new Date().toLocaleTimeString()} Waiting for API to be ready...`)
  await cache.api.isReady
  console.log(`${new Date().toLocaleTimeString()} API is ready`)

  return cache.api
}

const getBlockWithAllInfo = async (api: ApiPromise, blockNumber: number, wsUrl: string) => {
  const blockHash = await api.rpc.chain.getBlockHash(blockNumber)
  // const blockHash = '0x01001404c065a24495acb8f812871639bef58b3da9b71707805bf742e1703d83'
  const block = (await api.rpc.chain.getBlock(blockHash))
  const apiAt = await api.at(blockHash)
  const runtimeVersion = apiAt.runtimeVersion
  const rawEvents = await apiAt.query.system.events()

  // console.dir(block.block.extrinsics.toHuman(), {depth: 100})

  // fs.writeFileSync('./____examples/block_json.json', JSON.stringify(block.toJSON(), null, 2))
  // fs.writeFileSync('./____examples/block_human.json', JSON.stringify(block.toHuman(), null, 2))

  const extrinsics = block.block.extrinsics.map((extrinsic, index) => {
    const result = {} as SubstrateExtrinsic

    const methodJson = extrinsic.method.toJSON()
    const human = extrinsic.toHuman() as any

    result.hash = extrinsic.hash.toJSON()
    result.extrinsicIndex = index
    result.extrinsicArgs = methodJson.args
    result.callIndex = methodJson.callIndex
    result.section = human.method.section
    result.method = human.method.method
    return result
  })

  const blockTimestamp = extrinsics.find(extrinsic => extrinsic.section === 'timestamp' && extrinsic.method === 'set')?.extrinsicArgs.now


  extrinsics.forEach(extrinsic => {
    extrinsic.blockNumber = blockNumber
    extrinsic.blockHash = blockHash.toHex()
    extrinsic.blockTimestamp = blockTimestamp
    extrinsic.events = []
  })

  const events = (rawEvents as any as any[]).map((event, index) => {
    const json = event.toJSON()
    const human = event.toHuman()
    const result = {} as SubstrateEvent

    const section = human.event.section
    const method = human.event.method

    const phaseJson = event.phase?.toJSON()
    let extrinsicIndex = phaseJson?.applyExtrinsic as number | null
    if (typeof extrinsicIndex !== 'number') {
      console.log(`Block ${blockNumber} event ${index} has no extrinsicIndex. phaseJson: ${JSON.stringify(phaseJson)}, event ${section}.${method}`)
      extrinsicIndex = null
    }

    result.section = section
    result.method = section
    result.extrinsicIndex = extrinsicIndex
    result.data = json.event.data
    result.topics = json.topics
    result.blockNumber = blockNumber
    result.blockHash = blockHash.toHex()
    result.blockTimestamp = blockTimestamp

    if (extrinsicIndex !== null && !!extrinsics[extrinsicIndex]) {
      extrinsics[extrinsicIndex].events.push(result)
    }

    return result
  })

  return {
    block: {
      blockNumber: blockNumber,
      blockHash: blockHash.toHex(),
      parentBlockHash: block.block.header.parentHash.toHex(),
      blockTimestamp: blockTimestamp,
      appsUiLink: `https://polkadot.js.org/apps/?rpc=${wsUrl}/#/explorer/query/${blockHash.toHex()}`,
    },
    extrinsics,
    events,
    blockRawJson: block.toJSON(),
    blockRawHuman: block.toHuman(),
  } satisfies SubstrateBlockResult
}

const getNextBlockNumberFromSubstrateBlockRaw = async (tableName: string) => {
  const db = getDb()

  const query = sql`
    SELECT
      MIN(block_number) + 1 AS "firstMissingNumber"
    FROM (
      SELECT block_number
      FROM $1
      ORDER BY block_number
    ) AS subquery
    WHERE
      block_number + 1 NOT IN (
        SELECT block_number FROM $1
      )
    ;`

  const result = await db.execute(query)

  return (result[0].firstMissingNumber as number) || 1
}


const main = async () => {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw Error(`DATABASE_URL not defined.`)
  }
  const db = getDb()

  const api = await connectToLightNode()

  const table = opalDb.substrateBlockRaw

  const maxBlockNumberInDbResult = await db.select({
    maxBlockNumber: sql<number>`max(${table.blockNumber.name})`,
  }).from(opalDb.substrateBlockRaw,)
  const maxBlockNumberInDb = maxBlockNumberInDbResult[0]?.maxBlockNumber || 1

  const result = await getBlockWithAllInfo(api, maxBlockNumberInDb, WS_URL)
  console.dir(result, {depth: 100})
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
}).finally(async () => {
  await Promise.all([
    cache.api?.disconnect(),
    disconnectFromDb(),
  ])
})
