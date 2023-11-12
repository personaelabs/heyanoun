"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genesisStateRoot = void 0;
const rlp_1 = require("@ethereumjs/rlp");
const util_1 = require("@ethereumjs/util");
const keccak_js_1 = require("ethereum-cryptography/keccak.js");
const trie_js_1 = require("../trie.js");
/**
 * Derives the stateRoot of the genesis block based on genesis allocations
 */
async function genesisStateRoot(genesisState) {
    const trie = new trie_js_1.Trie({ useKeyHashing: true });
    for (const [key, value] of Object.entries(genesisState)) {
        const address = (0, util_1.isHexPrefixed)(key) ? (0, util_1.toBytes)(key) : (0, util_1.unprefixedHexToBytes)(key);
        const account = new util_1.Account();
        if (typeof value === 'string') {
            account.balance = BigInt(value);
        }
        else {
            const [balance, code, storage, nonce] = value;
            if (balance !== undefined) {
                account.balance = BigInt(balance);
            }
            if (code !== undefined) {
                const codeBytes = (0, util_1.isHexPrefixed)(code) ? (0, util_1.toBytes)(code) : (0, util_1.unprefixedHexToBytes)(code);
                account.codeHash = (0, keccak_js_1.keccak256)(codeBytes);
            }
            if (storage !== undefined) {
                const storageTrie = new trie_js_1.Trie({ useKeyHashing: true });
                for (const [k, val] of storage) {
                    const storageKey = (0, util_1.isHexPrefixed)(k) ? (0, util_1.toBytes)(k) : (0, util_1.unprefixedHexToBytes)(k);
                    const storageVal = rlp_1.RLP.encode((0, util_1.unpadBytes)((0, util_1.isHexPrefixed)(val) ? (0, util_1.toBytes)(val) : (0, util_1.unprefixedHexToBytes)(val)));
                    await storageTrie.put(storageKey, storageVal);
                }
                account.storageRoot = storageTrie.root();
            }
            if (nonce !== undefined) {
                account.nonce = BigInt(nonce);
            }
        }
        await trie.put(address, account.serialize());
    }
    return trie.root();
}
exports.genesisStateRoot = genesisStateRoot;
//# sourceMappingURL=genesisState.js.map