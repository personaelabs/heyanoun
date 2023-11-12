import type { Nibbles } from '../types.js';
export declare class Node {
    _nibbles: Nibbles;
    _value: Uint8Array;
    _terminator: boolean;
    constructor(nibbles: Nibbles, value: Uint8Array, terminator: boolean);
    static decodeKey(key: Nibbles): Nibbles;
    key(k?: Nibbles): Nibbles;
    keyLength(): number;
    value(v?: Uint8Array): Uint8Array;
    encodedKey(): Nibbles;
    raw(): [Uint8Array, Uint8Array];
    serialize(): Uint8Array;
}
//# sourceMappingURL=node.d.ts.map