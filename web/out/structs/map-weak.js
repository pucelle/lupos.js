/**
 * `K1 -> K2 -> V` Map Struct.
 * Index values by a pair of keys.
 * `K1` must be object type.
 */
export class InternalWeakPairKeysMap {
    map = new WeakMap();
    /** Get associated value by key pair. */
    get(k1, k2) {
        let sub = this.map.get(k1);
        if (!sub) {
            return undefined;
        }
        return sub.get(k2);
    }
    /** Set key pair and value. */
    set(k1, k2, v) {
        let sub = this.map.get(k1);
        if (!sub) {
            sub = new Map();
            this.map.set(k1, sub);
        }
        sub.set(k2, v);
    }
    /** Delete all associated secondary keys and values by first key. */
    deleteOf(k1) {
        this.map.delete(k1);
    }
}
