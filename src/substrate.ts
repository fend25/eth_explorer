import axios from 'axios'
import * as fs from "fs";
import {SubstrateBlockInfo, SubstrateBlockResult} from "./types/substrate";

const RPC_URL = 'https://rpc-opal.unique.network'
const WS_URL = 'wss://ws-opal.unique.network'

const getBlock = async (blockNumber?: number) => {
  const response = await axios.post(RPC_URL, {
    jsonrpc: '2.0',
    id: 1,
    method: 'chain_getBlock',
    params: typeof blockNumber === 'number' ? [
      `0x${blockNumber.toString(16)}`,
    ] : []
  })
  return response.data.result as SubstrateBlockResult
}

const getBlockHash = async (blockNumber: number) => {
  const response = await axios.post(RPC_URL, {
    jsonrpc: '2.0',
    id: 1,
    method: 'chain_getBlockHash',
    params: [
      `0x${blockNumber.toString(16)}`,
    ]
  })
  return response.data.result as string
}

const getLastBlock = async () => {
  const response = await axios.post(RPC_URL, {
    jsonrpc: '2.0',
    id: 1,
    method: 'chain_getHeader',
    params: []
  })
  return {
    data: response.data.result as SubstrateBlockInfo,
    blockNumber: parseInt(response.data.result.number, 16)
  }
}

const getMetadata = async (blockHashOrNumber?: string | number) => {
  const blockHash =
    typeof blockHashOrNumber === 'number'
      ? (await getBlockHash(blockHashOrNumber))
      : blockHashOrNumber

  const response = (await axios.post(RPC_URL, {
    jsonrpc: '2.0',
    id: 1,
    method: 'state_getMetadata',
    params: [
      blockHash,
    ]
  }))
  const result = response.data.result
  return result
}

const main = async () => {
  // const lastBlock = await getLastBlock()
  // console.dir(lastBlock, {depth: 100})
  // await fs.writeFileSync('./examples/substrate_last_block.json', JSON.stringify(lastBlock.data, null, 2))

  console.log(await getMetadata(1595045))
}
main().catch((error) => {
  console.error(error)
  process.exit(1)
})
