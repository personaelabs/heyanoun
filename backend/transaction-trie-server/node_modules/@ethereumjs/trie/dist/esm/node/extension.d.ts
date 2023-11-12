import { Node } from './node.js';
import type { Nibbles } from '../types.js';
export declare class ExtensionNode extends Node {
    constructor(nibbles: Nibbles, value: Uint8Array);
    static encodeKey(key: Nibbles): Nibbles;
}
//# sourceMappingURL=extension.d.ts.map