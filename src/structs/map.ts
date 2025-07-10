
/** 
 * `K => V[]` Map Struct.
 * Good for purely adding.
 */
export class InternalListMap<K, V> {

	protected map: Map<K, V[]> = new Map()

	/** Get the count of all the keys. */
	keyCount(): number {
		return this.map.size
	}

	/** Get value list by associated key. */
	get(k: K): V[] | undefined {
		return this.map.get(k)
	}

	/** 
	 * Add a key and a value.
	 * Note it will not validate whether value exist,
	 * and will add value repeatedly although it exists.
	 */
	add(k: K, v: V) {
		let values = this.map.get(k)
		if (!values) {
			values = [v]
			this.map.set(k, values)
		}
		else {
			values.push(v)
		}
	}

	/** Delete a key value pair. */
	delete(k: K, v: V) {
		let values = this.map.get(k)
		if (values) {
			let index = values.indexOf(v)
			if (index > -1) {
				values.splice(index, 1)
				
				if (values.length === 0) {
					this.map.delete(k)
				}
			}
		}
	}
}


/** 
 * `K1 -> K2 -> V[]` Map Struct.
 * Index a value list by a pair of keys.
 */
export class InternalPairKeysListMap<K1, K2, V>{

	protected map: Map<K1, InternalListMap<K2, V>> = new Map()

	/** Get associated value list by key pair. */
	get(k1: K1, k2: K2): V[] | undefined {
		let sub = this.map.get(k1)
		if (!sub) {
			return undefined
		}

		return sub.get(k2)
	}

	/** Add key pair and associated value. */
	add(k1: K1, k2: K2, v: V) {
		let sub = this.map.get(k1)
		if (!sub) {
			sub = new InternalListMap()
			this.map.set(k1, sub)
		}

		sub.add(k2, v)
	}

	/** Delete a key pair and associated value. */
	delete(k1: K1, k2: K2, v: V) {
		let sub = this.map.get(k1)
		if (sub) {
			sub.delete(k2, v)

			if (sub.keyCount() === 0) {
				this.map.delete(k1)
			}
		}
	}
}


/**
 * Map Struct that can query from left to right and right to left.
 * `L -> R`
 * `R -> L`
 */
export class InternalTwoWayMap<L, R> {

	private lm: Map<L, R> = new Map()
	private rm: Map<R, L> = new Map()

	/** Iterate all left keys. */
	leftKeys(): Iterable<L> {
		return this.lm.keys()
	}

	/** Has a specified right key. */
	hasRight(r: R): boolean {
		return this.rm.has(r)
	}

	/** Get right key by a left key. */
	getByLeft(l: L): R | undefined {
		return this.lm.get(l)
	}

	/** Get left key by a right key. */
	getByRight(r: R): L | undefined {
		return this.rm.get(r)
	}

	/** 
	 * Set a left and right key pair.
	 * Note if left or right key is exist, would cause repetitive maps.
	 */
	set(l: L, r: R) {
		this.lm.set(l, r)
		this.rm.set(r, l)
	}
}
