import {gt, gte, not, sql, notInArray, SQL} from 'drizzle-orm'
import {PgDialect} from 'drizzle-orm/pg-core'

const pgDialect = new PgDialect()

Error.stackTraceLimit = 1000

import axios from 'axios'
import * as fs from 'fs'

import {ApiPromise, WsProvider} from '@polkadot/api'

import {SubstrateEvent, SubstrateExtrinsic, SubstrateBlockResult} from "./types/substrate";
import {disconnectFromDb, getDb} from "../dal/_config/connection";
import {blockTable} from "../dal/_config/schemas";

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

const getBlockWithAllInfo = async (api: ApiPromise, blockNumber: number) => {
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
    result.method = method
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
    chainName: 'opal',
    block: {
      blockNumber: blockNumber,
      blockHash: blockHash.toHex(),
      parentBlockHash: block.block.header.parentHash.toHex(),
      blockTimestamp: blockTimestamp,
      extrinsicsRoot: block.block.header.extrinsicsRoot.toHex(),
      stateRoot: block.block.header.stateRoot.toHex(),
      digest: {
        logs: block.block.header.digest.logs.map(log => {
          const json = log.toJSON() as {[K: string]: string[]}
          const human = log.toHuman() as {[K: string]: string[]}

          return Object.keys(json).reduce((acc, key) => {
            acc[key] = json[key]
            acc[key][0] = human[key][0]
            return acc
          }, {} as {[K: string]: string[]})
        })
      }
    },
    extrinsics,
    events,
  } satisfies SubstrateBlockResult
}

const main = async () => {
  const db = getDb()
  const api = await connect()

  const maxBlockNumberInDbResult = await db
    .select({maxBlockNumber: sql<string>`max(block_number)`})
    .from(blockTable)
  console.log(maxBlockNumberInDbResult)
  console.log(`maxBlockNumberInDbResult: ${JSON.stringify(maxBlockNumberInDbResult, null, 2)}`)
  const assumingAMaxBlockNumberInDb = parseInt(maxBlockNumberInDbResult[0].maxBlockNumber, 10)
  const maxBlockNumberInDb = isNaN(assumingAMaxBlockNumberInDb) ? 0 : assumingAMaxBlockNumberInDb

  console.log(`maxBlockNumberInDb: ${maxBlockNumberInDb}`)
  // const result = await getBlockWithAllInfo(api, maxBlockNumberInDb); console.dir(result, {depth: 100}); return

  const startTimeTotal = Date.now()

  const lastChainBlockHash = (await api.rpc.chain.getFinalizedHead()).toJSON()
  const lastChainBlockNumber = (await api.rpc.chain.getBlock(lastChainBlockHash)).block.header.number.toNumber()

  console.log(`Chain ${WS_URL}, last block number: ${lastChainBlockNumber}, hash: ${lastChainBlockHash}`)

  let blockNumber = maxBlockNumberInDb
  while (true) {
    const startTimestamp = Date.now()

    blockNumber += 1
    const afterGetNextBlockNumberTimestamp = Date.now()

    if (blockNumber > lastChainBlockNumber) {
      console.log(`All blocks inserted. Summary: ${Date.now() - startTimeTotal}ms`)
      break
    }

    const result = await getBlockWithAllInfo(api, blockNumber)
    const chainRequestTimestamp = Date.now()

    await db.insert(blockTable).values({
      blockNumber: result.block.blockNumber,
      blockHash: result.block.blockHash,
      blockTimestamp: new Date(result.block.blockTimestamp),
      blockInfo: result.block,
      extrinsics: result.extrinsics,
      events: result.events,
    }).onConflictDoNothing()

    const finishTimestamp = Date.now()
    console.log(
      `Block ${blockNumber} of ${lastChainBlockNumber} inserted. Time: ` +
      `next block: ${afterGetNextBlockNumberTimestamp - startTimestamp}ms, ` +
      `chain request: ${chainRequestTimestamp - afterGetNextBlockNumberTimestamp}ms, ` +
      `db insert: ${finishTimestamp - chainRequestTimestamp}ms. ` +
      `This block: ${finishTimestamp - startTimestamp}ms, total: ${finishTimestamp - startTimeTotal}ms`
    )
  }
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
