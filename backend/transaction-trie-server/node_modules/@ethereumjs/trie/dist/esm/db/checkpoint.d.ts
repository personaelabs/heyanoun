import { LRUCache } from 'lru-cache';
import type { Checkpoint, CheckpointDBOpts } from '../types.js';
import type { BatchDBOp, DB } from '@ethereumjs/util';
/**
 * DB is a thin wrapper around the underlying levelup db,
 * which validates inputs and sets encoding type.
 */
export declare class CheckpointDB implements DB {
    checkpoints: Checkpoint[];
    db: DB<string, string | Uint8Array>;
    readonly cacheSize: number;
    private readonly valueEncoding;
    protected _cache?: LRUCache<string, Uint8Array>;
    _stats: {
        cache: {
            reads: number;
            hits: number;
            writes: number;
        };
        db: {
            reads: number;
            hits: number;
            writes: number;
        };
    };
    /**
     * Initialize a DB instance.
     */
    constructor(opts: CheckpointDBOpts);
    /**
     * Flush the checkpoints and use the given checkpoints instead.
     * @param {Checkpoint[]} checkpoints
     */
    setCheckpoints(checkpoints: Checkpoint[]): void;
    /**
     * Is the DB during a checkpoint phase?
     */
    hasCheckpoints(): boolean;
    /**
     * Adds a new checkpoint to the stack
     * @param root
     */
    checkpoint(root: Uint8Array): void;
    /**
     * Commits the latest checkpoint
     */
    commit(): Promise<void>;
    /**
     * Reverts the latest checkpoint
     */
    revert(): Promise<Uint8Array>;
    /**
     * @inheritDoc
     */
    get(key: Uint8Array): Promise<Uint8Array | undefined>;
    /**
     * @inheritDoc
     */
    put(key: Uint8Array, value: Uint8Array): Promise<void>;
    /**
     * @inheritDoc
     */
    del(key: Uint8Array): Promise<void>;
    /**
     * @inheritDoc
     */
    batch(opStack: BatchDBOp[]): Promise<void>;
    stats(reset?: boolean): {
        size: number;
        cache: {
            reads: number;
            hits: number;
            writes: number;
        };
        db: {
            reads: number;
            hits: number;
            writes: number;
        };
    };
    /**
     * @inheritDoc
     */
    shallowCopy(): CheckpointDB;
    open(): Promise<void>;
}
//# sourceMappingURL=checkpoint.d.ts.map