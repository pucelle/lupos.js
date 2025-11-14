import * as lupos from '../../../out'
import {describe, it, expect} from 'vitest'


describe('SSR', () => {
	it('hydrates root container', async () => {
		const root = document.createElement('div')
		root.innerHTML = '<div>SSR</div>'

		const rendered = lupos.hydrate(root, lupos.html`<div>123</div>`)
		await untilUpdateComplete()

		expect(root.innerHTML).toBe('<div>123</div>')
		expect(rendered.el).toBe(root)
	})
})
