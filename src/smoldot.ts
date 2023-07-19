import {ApiPromise} from '@polkadot/api'
import {ScProvider} from '@polkadot/rpc-provider'
import * as Sc from '@substrate/connect'

import jsonParachainSpec from './chain_specs/unique.json'

const parachainSpec = JSON.stringify(jsonParachainSpec)

const relayProvider = new ScProvider(Sc, Sc.WellKnownChain.polkadot)
const provider = new ScProvider(Sc, parachainSpec, relayProvider)

console.time('##### CONNECT')

console.timeLog('##### CONNECT', 'connecting to relay chain')

await relayProvider.connect()

console.timeLog('##### CONNECT', 'relay chain connected, connecting to parachain')

await provider.connect()

console.timeLog('##### CONNECT', 'parachain connected, creating api')

const polkadotApi = await ApiPromise.create({provider})

console.timeLog('##### CONNECT', 'api created')

console.timeEnd('##### CONNECT')

await polkadotApi.rpc.chain.subscribeNewHeads((lastHeader) => {
  console.log(lastHeader.number.toString())
})

await polkadotApi.disconnect()
