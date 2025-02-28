import {deleteCrossFadeElementForPairOnly, setCrossFadeElementForPairOnly} from '@pucelle/ff'
import {Binding} from './types'
import {Part} from '../part'


/**
 * `:crossFadePair` can bind an element to provide rect for later crossfade transition,
 * but the element itself will not participate crossfade transition.
 * - `<el :crossFadePair=${fade({duration, ...})}>`
 */
export class crossFadePair implements Binding, Part {

	private readonly el: Element
	private key: any | null = null
	private connected: boolean = false

	constructor(el: Element) {
		this.el = el
	}

	afterConnectCallback() {
		if (this.connected) {
			return
		}

		this.connected = true

		if (this.key !== null) {
			setCrossFadeElementForPairOnly(this.key, this.el)
		}
	}

	beforeDisconnectCallback(): Promise<void> | void {
		if (!this.connected) {
			return
		}

		this.connected = false

		if (this.key !== null) {
			deleteCrossFadeElementForPairOnly(this.key)
		}
	}

	update(key: any) {
		this.key = key

		if (this.connected) {
			setCrossFadeElementForPairOnly(this.key, this.el)
		}
	}
}