import axios from 'axios'

const RPC_URL = 'https://rpc-opal.unique.network'

const getBlock = async (blockNumber?: number) => {
  const response = await axios.post(RPC_URL, {
    jsonrpc: '2.0',
    id: 1,
    method: 'chain_getBlock',
    params: typeof blockNumber === 'number' ? [
      `0x${blockNumber.toString(16)}`,
    ] : []
  })
  return response.data.result
}

const getLastBlock = async () => {
  const response = await axios.post(RPC_URL, {
    jsonrpc: '2.0',
    id: 1,
    method: 'chain_getHeader',
    params: []
  })
  return {
    data:  response.data.result,
    blockNumber: parseInt(response.data.result.number, 16)
  }
}

const main = async () => {
  const lastBlock = await getBlock()
  console.dir(lastBlock, {depth: 100})
}
main().catch((error) => {
  console.error(error)
  process.exit(1)
})
