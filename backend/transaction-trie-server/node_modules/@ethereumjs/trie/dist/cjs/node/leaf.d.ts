import { Node } from './node.js';
import type { Nibbles } from '../types.js';
export declare class LeafNode extends Node {
    constructor(nibbles: Nibbles, value: Uint8Array);
    static encodeKey(key: Nibbles): Nibbles;
}
//# sourceMappingURL=leaf.d.ts.map