/**
 * Assign keys and values from `source` to `target`, overwrite same-keyed values of the `target`.
 * Will skip specified `keys` of source object.
 *
 * Note here `undefined` values are treated as non-existent.
 */
export function assignWithoutKeys(target, source, keys) {
    for (let key of Object.keys(source)) {
        if (keys.includes(key)) {
            continue;
        }
        let value = source[key];
        if (value !== undefined) {
            target[key] = value;
        }
    }
    return target;
}
