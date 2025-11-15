import * as lupos from '../../../web/out'
import {SSR} from '../../../ssr/out'
import {describe, it, expect} from 'vitest'


class SSRTest extends lupos.Component {

	static style = lupos.css`.ssr-test{color: red}`

	protected render(): lupos.RenderResult {
		return lupos.html`<template class="ssr-test">SSR</template>`
	}
}

lupos.defineCustomElement('ssr-test', SSRTest)


describe('SSR', () => {
	it('ssr component', async () => {
		let ssr = new SSR('/')
		let rendered = await ssr.renderToString(lupos.html`<SSRTest>`)
		expect(rendered).toBe('<div class="ssr-test">SSR</div>')
		expect(await ssr.toString()).toBe('<!DOCTYPE html><html><head><style name="SSRTest">.ssr-test{color: red}</style></head><body></body></html>')
	})

	it('ssr custom tag', async () => {
		let ssr = new SSR('/')
		ssr.document.body.insertAdjacentHTML('beforeend', '<ssr-test></ssr-test>')
		expect(await ssr.toString()).toBe('<!DOCTYPE html><html><head><style name="SSRTest">.ssr-test{color: red}</style></head><body><ssr-test class="ssr-test">SSR</ssr-test></body></html>')
	})
})
