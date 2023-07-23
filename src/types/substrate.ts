export interface SubstrateBlockResult {
  chainName: string
  block: SubstrateBlock
  extrinsics: SubstrateExtrinsic[]
  events: SubstrateEvent[]
}

export interface SubstrateBlock {
  blockNumber: number
  blockHash: string
  parentBlockHash: string
  blockTimestamp: number

  stateRoot: string
  extrinsicsRoot: string

  digest: {
    logs: Array<{ [K in string]: string[] }>
  }
}

export interface SubstrateEvent<EventData = any> {
  section: string
  method: string
  extrinsicIndex: number | null
  data: EventData
  topics: any[]
  blockNumber: number
  blockHash: string
  blockTimestamp: number
}

export interface SubstrateExtrinsic<ExtrinsicArgs = any> {
  hash: string
  extrinsicIndex: number
  extrinsicArgs: ExtrinsicArgs
  callIndex: string
  section: string
  method: string
  blockNumber: number
  blockHash: string
  blockTimestamp: number
  events: SubstrateEvent[]
}





