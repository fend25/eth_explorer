import * as cql from './pkg/circumcised_chainql.js';

// const BLOCK = '0xb8b65caada500950070e17c18af537c0d7c86b9f224eaca0ebd5f2697341e1da';
const BLOCK = '0x530291eb18106795bfeb20ad441657330cfcfb3b3dd209166859997771fb1edf'
// const RPC = 'https://rpc-quartz.unique.network:443/';
const RPC = 'https://rpc-opal.unique.network/'

// https://storage.unique.network/demo-bucket/block_1596043.json

async function rpc(method, params) {
    const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })
    console.log(body)

    const data = await fetch(RPC, {
        method: 'POST',
        body,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(r => r.json());
    if (data.error) {
        throw new Error(data.error.message);
    }
    return data.result;
}
function toHex(str) {
    if (!str.startsWith('0x')) throw new Error('Not hex');
    const out = new Uint8Array(str.slice(2).match(/../g).map(v => parseInt(v, 16)));
    return out;
}

const metadata = toHex(await rpc('state_getMetadata', [BLOCK]));

const handle = cql.from_raw(metadata);
const eventsType = JSON.parse(cql.list_types(handle)).find(t => t.name === 'Vec<frame_system::EventRecord<opal_runtime::RuntimeEvent, primitive_types::H256>>').id
// Hex here - encoded storage key for system.events
const events = toHex(await rpc('state_getStorage', ['0x26aa394eea5630e07c48ae0c9558cef780d41e5e16056765bc8461851072c9d7', BLOCK]));
const decoded = JSON.parse(cql.to_json(handle, eventsType, events));
console.dir(decoded, {depth: 100});
