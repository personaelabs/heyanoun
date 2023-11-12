import { BranchNode } from './branch.js';
import { ExtensionNode } from './extension.js';
import { LeafNode } from './leaf.js';
import type { NestedUint8Array } from '@ethereumjs/util';
export declare function decodeRawNode(raw: Uint8Array[]): BranchNode | ExtensionNode | LeafNode;
export declare function isRawNode(n: Uint8Array | NestedUint8Array): n is Uint8Array[];
export declare function decodeNode(node: Uint8Array): BranchNode | ExtensionNode | LeafNode;
//# sourceMappingURL=util.d.ts.map