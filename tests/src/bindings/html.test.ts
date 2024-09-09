import {HTMLBinding} from '../../../'


describe('Test :html', () => {
	test(':html=${...}', () => {
		let div = document.createElement('div')
		let b = new HTMLBinding(div)

		b.update('<div>123</div>')
		expect(div.innerHTML).toEqual('<div>123</div>')

		b.update('<script ></script>')
		expect(div.innerHTML).toEqual('')

		b.update('<div onclick="alert(123)">123</div>')
		expect(div.innerHTML).toEqual('<div>123</div>')
	})
})