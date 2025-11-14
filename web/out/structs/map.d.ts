/**
 * `K => V[]` Map Struct.
 * Good for purely adding.
 */
export declare class InternalListMap<K, V> {
    protected map: Map<K, V[]>;
    /** Get the count of all the keys. */
    keyCount(): number;
    /** Get value list by associated key. */
    get(k: K): V[] | undefined;
    /**
     * Add a key and a value.
     * Note it will not validate whether value exist,
     * and will add value repeatedly although it exists.
     */
    add(k: K, v: V): void;
    /** Delete a key value pair. */
    delete(k: K, v: V): void;
}
/**
 * `K1 -> K2 -> V[]` Map Struct.
 * Index a value list by a pair of keys.
 */
export declare class InternalPairKeysListMap<K1, K2, V> {
    protected map: Map<K1, InternalListMap<K2, V>>;
    /** Get associated value list by key pair. */
    get(k1: K1, k2: K2): V[] | undefined;
    /** Add key pair and associated value. */
    add(k1: K1, k2: K2, v: V): void;
    /** Delete a key pair and associated value. */
    delete(k1: K1, k2: K2, v: V): void;
}
/**
 * Map Struct that can query from left to right and right to left.
 * `L -> R`
 * `R -> L`
 */
export declare class InternalTwoWayMap<L, R> {
    private lm;
    private rm;
    /** Iterate all left keys. */
    leftKeys(): Iterable<L>;
    /** Has a specified right key. */
    hasRight(r: R): boolean;
    /** Get right key by a left key. */
    getByLeft(l: L): R | undefined;
    /** Get left key by a right key. */
    getByRight(r: R): L | undefined;
    /**
     * Set a left and right key pair.
     * Note if left or right key is exist, would cause repetitive maps.
     */
    set(l: L, r: R): void;
}
