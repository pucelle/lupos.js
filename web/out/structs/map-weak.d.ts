/**
 * `K1 -> K2 -> V` Map Struct.
 * Index values by a pair of keys.
 * `K1` must be object type.
 */
export declare class InternalWeakPairKeysMap<K1 extends object, K2, V> {
    private map;
    /** Get associated value by key pair. */
    get(k1: K1, k2: K2): V | undefined;
    /** Set key pair and value. */
    set(k1: K1, k2: K2, v: V): void;
    /** Delete all associated secondary keys and values by first key. */
    deleteOf(k1: K1): void;
}
