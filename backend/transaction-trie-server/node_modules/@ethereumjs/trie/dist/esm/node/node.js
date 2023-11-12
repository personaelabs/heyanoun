import { RLP } from '@ethereumjs/rlp';
import { addHexPrefix, removeHexPrefix } from '../util/hex.js';
import { nibblestoBytes } from '../util/nibbles.js';
export class Node {
    constructor(nibbles, value, terminator) {
        this._nibbles = nibbles;
        this._value = value;
        this._terminator = terminator;
    }
    static decodeKey(key) {
        return removeHexPrefix(key);
    }
    key(k) {
        if (k !== undefined) {
            this._nibbles = k;
        }
        return this._nibbles.slice(0);
    }
    keyLength() {
        return this._nibbles.length;
    }
    value(v) {
        if (v !== undefined) {
            this._value = v;
        }
        return this._value;
    }
    encodedKey() {
        return addHexPrefix(this._nibbles.slice(0), this._terminator);
    }
    raw() {
        return [nibblestoBytes(this.encodedKey()), this._value];
    }
    serialize() {
        return RLP.encode(this.raw());
    }
}
//# sourceMappingURL=node.js.map