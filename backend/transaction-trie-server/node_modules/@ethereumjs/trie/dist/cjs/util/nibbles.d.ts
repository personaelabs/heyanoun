import type { Nibbles } from '../types.js';
/**
 * Converts a bytes to a nibble array.
 * @private
 * @param key
 */
export declare function bytesToNibbles(key: Uint8Array): Nibbles;
/**
 * Converts a nibble array into bytes.
 * @private
 * @param arr - Nibble array
 */
export declare function nibblestoBytes(arr: Nibbles): Uint8Array;
/**
 * Compare two nibble array.
 * * `0` is returned if `n2` === `n1`.
 * * `1` is returned if `n2` > `n1`.
 * * `-1` is returned if `n2` < `n1`.
 * @param n1 - Nibble array
 * @param n2 - Nibble array
 */
export declare function nibblesCompare(n1: Nibbles, n2: Nibbles): number;
/**
 * Returns the number of in order matching nibbles of two give nibble arrays.
 * @private
 * @param nib1
 * @param nib2
 */
export declare function matchingNibbleLength(nib1: Nibbles, nib2: Nibbles): number;
/**
 * Compare two nibble array keys.
 * @param keyA
 * @param keyB
 */
export declare function doKeysMatch(keyA: Nibbles, keyB: Nibbles): boolean;
//# sourceMappingURL=nibbles.d.ts.map