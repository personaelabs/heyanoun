import { RLP } from '@ethereumjs/rlp';
import { isTerminator } from '../util/hex.js';
import { bytesToNibbles } from '../util/nibbles.js';
import { BranchNode } from './branch.js';
import { ExtensionNode } from './extension.js';
import { LeafNode } from './leaf.js';
export function decodeRawNode(raw) {
    if (raw.length === 17) {
        return BranchNode.fromArray(raw);
    }
    else if (raw.length === 2) {
        const nibbles = bytesToNibbles(raw[0]);
        if (isTerminator(nibbles)) {
            return new LeafNode(LeafNode.decodeKey(nibbles), raw[1]);
        }
        return new ExtensionNode(ExtensionNode.decodeKey(nibbles), raw[1]);
    }
    else {
        throw new Error('Invalid node');
    }
}
export function isRawNode(n) {
    return Array.isArray(n) && !(n instanceof Uint8Array);
}
export function decodeNode(node) {
    const decodedNode = RLP.decode(Uint8Array.from(node));
    if (!isRawNode(decodedNode)) {
        throw new Error('Invalid node');
    }
    return decodeRawNode(decodedNode);
}
//# sourceMappingURL=util.js.map