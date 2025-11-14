import * as lupos from '../../../out'
import * as ssr from '../../../ssr/out'
import {describe, it, expect} from 'vitest'


class Simple extends lupos.Component {
	protected render() {
		return lupos.html`<div>a</div>`
	}
}

describe('HydrateElement', () => {
	it('hydrates an element to a component instance', async () => {
		const el = document.createElement('div')
		const com = lupos.hydrateElement(el, Simple)
		await untilUpdateComplete()
		expect(com.el).toBe(el)
		expect(el.innerHTML).toBe('<div>a</div>')
	})
})
