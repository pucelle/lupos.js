import * as linkedom from 'linkedom'


/** Initialize global variables to simulate a browser environment. */
export function ensureDOM() {
	if (typeof window !== 'undefined') {
		return
	}

	let parseHTML = linkedom.parseHTML
	let {window: win} = parseHTML('<!doctype html><html><head></head><body></body></html>')
	let global = globalThis as any

	global.HTMLElement = win.HTMLElement
	global.Node = win.Node

	global.window = win
	global.document = win.document
	global.navigator = win.navigator
	global.customElements = win.customElements

	global.requestAnimationFrame = function(callback: (timestamp: number) => void) {
		callback(0)
	}
}