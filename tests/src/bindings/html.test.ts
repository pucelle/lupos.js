import * as lupos from '../../../'
import {describe, it, expect} from 'vitest'


describe('Test :html', () => {
	it(':html=${...}', () => {
		let div = document.createElement('div')
		let b = new lupos.HTMLBinding(div)

		b.update('<div>123</div>')
		expect(div.innerHTML).toEqual('<div>123</div>')

		b.update('<script ></script>')
		expect(div.innerHTML).toEqual('')

		b.update('<div onclick="alert(123)">123</div>')
		expect(div.innerHTML).toEqual('<div>123</div>')
	})
})