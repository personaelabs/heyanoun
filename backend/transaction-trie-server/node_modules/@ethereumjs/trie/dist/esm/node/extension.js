import { addHexPrefix } from '../util/hex.js';
import { Node } from './node.js';
export class ExtensionNode extends Node {
    constructor(nibbles, value) {
        super(nibbles, value, false);
    }
    static encodeKey(key) {
        return addHexPrefix(key, false);
    }
}
//# sourceMappingURL=extension.js.map