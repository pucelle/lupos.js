/**
 * Assign keys and values from `source` to `target`, overwrite same-keyed values of the `target`.
 * Will skip specified `keys` of source object.
 *
 * Note here `undefined` values are treated as non-existent.
 */
export declare function assignWithoutKeys<T extends object, S extends object>(target: T, source: S, keys: (keyof S)[]): T & S;
