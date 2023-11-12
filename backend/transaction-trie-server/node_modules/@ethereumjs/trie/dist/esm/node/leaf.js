import { addHexPrefix } from '../util/hex.js';
import { Node } from './node.js';
export class LeafNode extends Node {
    constructor(nibbles, value) {
        super(nibbles, value, true);
    }
    static encodeKey(key) {
        return addHexPrefix(key, true);
    }
}
//# sourceMappingURL=leaf.js.map