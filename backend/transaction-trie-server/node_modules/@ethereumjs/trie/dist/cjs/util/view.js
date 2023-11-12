"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.view = void 0;
const debug_1 = require("debug");
const utils_1 = require("ethereum-cryptography/utils");
const index_js_1 = require("../node/index.js");
const trie_js_1 = require("../trie.js");
const debug = (0, debug_1.debug)('trieview');
const delimeters = {
    0: debug.extend(''),
    1: debug.extend('::'),
    2: debug.extend('::::'),
    3: debug.extend('::::::'),
    4: debug.extend('::::::::'),
    5: debug.extend('::::::::::'),
};
const delimiter = (level) => {
    delimeters[level]('-'.repeat(50 - level * 2));
};
const tNode = ['br', 'lf', 'ex', 'rt', 'nl', 'pf', 'vl'];
const debugN = (type, d) => {
    d = d ?? debug;
    const nodeDebuggers = {
        br: d.extend('BranchNode'),
        lf: d.extend('ExtensionNode'),
        ex: d.extend('LeafNode'),
        rt: d.extend('RootNode'),
        nl: d.extend('NullNode'),
        pf: d.extend('ProofNode'),
        vl: d.extend('ValueNode'),
    };
    return nodeDebuggers[type];
};
const debugT = debug.extend('Trie');
function getNodeType(node) {
    return node instanceof index_js_1.BranchNode
        ? 'br'
        : node instanceof index_js_1.ExtensionNode
            ? 'ex'
            : node instanceof index_js_1.LeafNode
                ? 'lf'
                : 'nl';
}
function logNode(trie, node, currentKey) {
    delimiter(3);
    const type = getNodeType(node);
    if ((0, utils_1.equalsBytes)(trie.hash(node.serialize()), trie.root())) {
        debugN('rt').extend(type)(`{ 0x${(0, utils_1.bytesToHex)(trie.hash(node.serialize())).slice(0, 12)}... } ---- \uD83D\uDCA5  \u211B \u2134 \u2134 \u0164  \u0147 \u2134 \u0221 \u2211  \u2737`);
    }
    else {
        debugN(type)(`{ 0x${(0, utils_1.bytesToHex)(trie.hash(node.serialize())).slice(0, 12)}... } ----`);
    }
    debugT.extend('Walking')(`from [${currentKey}]`);
    if ('_nibbles' in node) {
        debugT(`to =>`, `[${node._nibbles}]`);
        debugT(`next key: [${[...currentKey, node._nibbles]}]`);
    }
    else if ('_branches' in node) {
        let first = true;
        for (const [idx, k] of [...node._branches.entries()]
            .filter(([_, child]) => child !== null && child.length > 0)
            .map(([nibble, _]) => nibble)
            .entries()) {
            first || debugN('br').extend(idx.toString())('\uD83D\uDDD8  \u0026');
            first = false;
            debugT(`to =>`, `[${k}]`);
            debugT(`next key: [${[...currentKey, [k]]}]`);
        }
    }
    delimiter(3);
}
const view = async (testName, inputs, root) => {
    const trie = new trie_js_1.Trie();
    const expect = root;
    const testKeys = new Map();
    const testStrings = new Map();
    for await (const [idx, input] of inputs.entries()) {
        const stringPair = [inputs[idx][0], inputs[idx][1] ?? 'null'];
        for (let i = 0; i < 2; i++) {
            if (typeof input[i] === 'string' && input[i].slice(0, 2) === '0x') {
                input[i] = (0, utils_1.hexToBytes)(input[i]);
            }
            else if (typeof input[i] === 'string') {
                input[i] = (0, utils_1.utf8ToBytes)(input[i]);
            }
        }
        try {
            await trie.put(input[0], input[1]);
        }
        catch (e) {
            debugT(`trie.put error: ${e.message}`);
        }
        trie.checkpoint();
        await trie.commit();
        trie.flushCheckpoints();
        testKeys.set((0, utils_1.bytesToHex)(input[0]), input[1]);
        testStrings.set((0, utils_1.bytesToHex)(input[0]), stringPair);
        for await (const [key, _val] of testKeys.entries()) {
            const retrieved = await trie.get((0, utils_1.hexToBytes)(key));
            debugT.extend('get')(`[${key}]: ${retrieved && (0, utils_1.equalsBytes)(retrieved, (0, utils_1.hexToBytes)(key))}`);
        }
    }
    debugT((0, utils_1.bytesToHex)(trie.root()), expect);
    const walker = trie.walkTrieIterable(trie.root(), []);
    delimiter(4);
    debug.extend('TEST_NAME')(testName);
    for await (const { currentKey, node } of walker) {
        logNode(trie, node, currentKey);
    }
};
exports.view = view;
//# sourceMappingURL=view.js.map