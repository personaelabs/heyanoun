import type { EmbeddedNode } from '../types.js';
export declare class BranchNode {
    _branches: (EmbeddedNode | null)[];
    _value: Uint8Array | null;
    constructor();
    static fromArray(arr: Uint8Array[]): BranchNode;
    value(v?: Uint8Array | null): Uint8Array | null;
    setBranch(i: number, v: EmbeddedNode | null): void;
    raw(): (EmbeddedNode | null)[];
    serialize(): Uint8Array;
    getBranch(i: number): EmbeddedNode | null;
    getChildren(): [number, EmbeddedNode][];
}
//# sourceMappingURL=branch.d.ts.map