import {untilUpdateComplete} from '@pucelle/lupos'
import * as lupos from '../../../'
import {describe, it, expect} from 'vitest'


describe('Test TemplateSlot', () => {

	it('TemplateSlot', async () => {
		let container = document.createElement('div')
		let pos1 = new lupos.SlotPosition(lupos.SlotPositionType.AfterContent, container)
		let slot = new lupos.TemplateSlot<any>(pos1, null)
		let result = lupos.html`<div>1</div>`
		let text = document.createTextNode('3')

		slot.update(result)
		await untilUpdateComplete()
		expect(container.textContent).toBe('1')

		slot.update([result, result])
		await untilUpdateComplete()
		expect(container.textContent).toBe('11')

		slot.update('2')
		await untilUpdateComplete()
		expect(container.textContent).toBe('2')

		slot.update(text)
		await untilUpdateComplete()
		expect(container.textContent).toBe('3')
	})
})