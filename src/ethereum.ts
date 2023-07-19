import {ethers} from 'ethers'

import * as dotenv from 'dotenv'

import { Coder } from 'abi-coder'

dotenv.config()

export type IBlock = {
  _type: 'Block'
  baseFeePerGas: string
  difficulty: string
  extraData: string
  gasLimit: string
  gasUsed: string
  hash: string
  miner: string
  nonce: string
  number: number
  parentHash: string
  timestamp: number
  transactions: ITransaction[]
}

export interface ITransaction {
  _type: string
  blockHash: string
  blockNumber: number
  contractAddress: any
  cumulativeGasUsed: string
  from: string
  gasPrice: string
  gasUsed: string
  hash: string
  index: number
  logs: ILog[]
  logsBloom: string
  status: number
  to: string
}

export interface ILog {
  _type: string
  address: string
  blockHash: string
  blockNumber: number
  data: string
  index: number
  topics: string[]
  transactionHash: string
  transactionIndex: number
}

const getBlock = async (provider: ethers.Provider, blockNumber: number): Promise<IBlock> => {
  const blockInfo = await provider.getBlock(blockNumber, true)
  if (!blockInfo) throw Error(`Block not found.`)

  // console.log(blockInfo?.toJSON())
  const transactionHashes = blockInfo.transactions
  const block = JSON.parse(JSON.stringify(blockInfo.toJSON()))
  block.transactions = []

  block.transactions = (await Promise.all(transactionHashes.map((transactionHash) => provider.getTransactionReceipt(transactionHash))))
    .filter((receipt) => receipt !== null)
    .map(receipt => receipt!.toJSON() as unknown as ITransaction)

  return block
}

const main = async () => {
  const rpcUrl = process.env.RPC_UNIQSU
  if (!rpcUrl) throw Error(`Please set a RPC_UNIQSU environment variable.`)

  const websocketUrl = process.env.WS_UNIQSU
  if (!websocketUrl) throw Error(`Please set a WS_UNIQSU environment variable.`)

  const provider = new ethers.WebSocketProvider(websocketUrl)

  const blockNumber = await provider.getBlockNumber()
  console.log('blockNumber: ', blockNumber)

  // await provider.on("block", (blockNumber: number, eventPayload) => {
  //   console.log("new block", blockNumber, eventPayload)
  // });

  //  //8296156
  // const block = await getBlock(provider, 8327215)
  // console.log(block)

  const tx = await provider.getTransactionReceipt('0x9f05a68f33476322e22b5872e32193d803be10c44ad6812bf25745c4f7434770')
  console.log(tx)

  //todo:
  // 1. instantiate last block id records in db
  // 2. pick random blocks and scan them
  // 3. do until all blocks are scanned
  // 4. append new blocks to db on new block event
  // 5. reselect from db time to time to check if any block is missing and scan it

  // const REDIS_CONNECTION = {
  //   host: '127.0.0.1',
  //   port: 6379
  // }
  //
  // const worker = new Worker('Block', async job => {
  //   if (job.name === 'block_scan_request') {
  //     console.log(`processing job ${job.id} with data`, job.data)
  //   }
  // }, {connection: REDIS_CONNECTION})
  //
  // const blockQueue = new Queue('Block', {
  //   connection: REDIS_CONNECTION
  // })
  //
  // await blockQueue.add('block_scan_request', {blockNumber: 8327215});
}

main().catch((err: any) => {
  console.error(err)
  process.exit(1)
})
