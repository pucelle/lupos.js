import {Observed, untilUpdateComplete} from '@pucelle/lupos'
import * as lupos from '../../../'


describe('Test render', () => {

	test('Render Static', async () => {
		let rendered = lupos.render(lupos.html`<div>123</div>`)
		rendered.appendTo(document.body)

		await untilUpdateComplete()
		expect(rendered.el.innerHTML).toBe(`<div>123</div>`)
	})


	test('Render Dynamic', async () => {
		let o: Observed<{value: number}> = {value: 1}

		let rendered = lupos.render(() => {
			return lupos.html`<div>${o.value}</div>`
		})

		rendered.appendTo(document.body)
		await untilUpdateComplete()
		expect(rendered.el.innerHTML).toBe(`<div>1</div>`)

		o.value = 2
		await untilUpdateComplete()
		expect(rendered.el.innerHTML).toBe(`<div>2</div>`)
	})
})