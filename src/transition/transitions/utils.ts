/**
 * Assign keys and values from `source` to `target`, overwrite same-keyed values of the `target`.
 * Will skip specified `keys` of source object.
 * 
 * Note here `undefined` values are treated as non-existent.
 */
export function assignWithoutKeys<T extends object, S extends object>(target: T, source: S, keys: (keyof S)[]): T & S {
	for (let key of Object.keys(source) as (keyof S)[]) {
		if (keys.includes(key)) {
			continue
		}

		let value = source[key]
		if (value !== undefined) {
			target[key as unknown as keyof T] = value as any
		}
	}

	return target as T & S
}