import * as pkg from './pkg/chainql.js';
const {MetaDec} = pkg;

const blockNUMBER = 1596043

const BLOCK = '0x017966df0a11f8f12db6b228f9447fa599aabe65c1b74ea55e13d18887184d64';
const RPC = 'https://dot-rpc.stakeworld.io:443/';

async function rpc(method, params) {
    const data = await fetch(RPC, {
        method: 'POST',
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(r => r.json());
    if (data.error) {
        throw new Error(data.error.message);
    }
    return data.result;
}
function fromHex(str) {
    if (!str.startsWith('0x')) throw new Error('Not hex');
    const out = new Uint8Array(str.slice(2).match(/../g).map(v => parseInt(v, 16)));
    return out;
}
function toHex(arr) {
    return '0x' + [...arr].map(v=>v.toString(16).padStart(2, '0')).join('');
}

const metadata = fromHex(await rpc('state_getMetadata', [BLOCK]));

const handle = new MetaDec(metadata);
for (const accty of handle.types().filter(t=>t.name === 'Vec<u8>' || /^\[u8; \d+\]$/.test(t.name))) {
    // Serialize byte arrays as Uint8Array
    handle.add_alt_uint8a(accty.ty);
}
for (const accty of handle.types().filter(t=>t.name === 'sp_core::crypto::AccountId32')) {
    // Serialize account id type as ss58 with chainid=42
    handle.add_alt_account_ss58(accty.ty, 42);
}

const getBlock = async() => {
	return await rpc('chain_getBlock', [BLOCK]);
}
const getStorage = async (pallet, entry, keys) => {
	const encodedKey = handle.encode_key(pallet, entry, keys);
	const encodedValue = fromHex(await rpc('state_getStorage', [toHex(encodedKey), BLOCK]));
	const value = handle.decode_value(pallet, entry, encodedValue);
	return value;
};

const block = await getBlock();
for (const ext of block.block.extrinsics) {
	console.dir(handle.decode_extrinsic(fromHex(ext)), {depth: 1000});
}
console.dir(await getStorage('System', 'Events', []), {depth: 100});

