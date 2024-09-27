import {untilComplete} from '@pucelle/ff'
import * as lupos from '../../../'


describe('Test TemplateSlot', () => {

	test('TemplateSlot', async () => {
		let container = document.createElement('div')
		let pos1 = new lupos.SlotPosition(lupos.SlotPositionType.AfterContent, container)
		let slot = new lupos.TemplateSlot<any>(pos1, null)
		let result = lupos.html`<div>1</div>`
		let text = document.createTextNode('3')

		slot.update(result)
		await untilComplete()
		expect(container.textContent).toBe('1')

		slot.update([result, result])
		await untilComplete()
		expect(container.textContent).toBe('11')

		slot.update('2')
		await untilComplete()
		expect(container.textContent).toBe('2')

		slot.update(text)
		await untilComplete()
		expect(container.textContent).toBe('3')
	})
})