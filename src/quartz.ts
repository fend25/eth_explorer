import { createScClient, WellKnownChain } from "@substrate/connect"
import quartzChainSpec from "./chain_specs/quartz.json"

const client = createScClient()
const polkadot = await client.addWellKnownChain(WellKnownChain.ksmcc3)
let prev = { isSyncing: false, peers: -1, shouldHavePeers: false }

const identity = await client.addChain(JSON.stringify(quartzChainSpec), (response) => {
  setTimeout(askForHealth, 1_000)

  const { result } = JSON.parse(response)
  if (
    result.isSyncing !== prev.isSyncing ||
    result.peers !== prev.peers ||
    result.shouldHavePeers !== prev.shouldHavePeers
  ) {
    console.log("system health update:", result)
    prev = result
  } else {
    console.count("system health remains the same")
  }
})

const askForHealth = () => {
  identity.sendJsonRpc(
    '{"jsonrpc":"2.0","id":"foo","method":"system_health","params":[]}',
  )
}

askForHealth()
