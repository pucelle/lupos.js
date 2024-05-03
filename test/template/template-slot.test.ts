import {UpdateQueue} from '@pucelle/ff'
import {SlotPositionType, TemplateMaker, SlotPosition, createHTMLTemplateFn, TemplateSlot, CompiledTemplateResult} from '../../src'


describe('Test TemplateSlot', () => {

	test('TemplateSlot', async () => {
		let t1 = createHTMLTemplateFn('<div>1</div>')

		// Compile from html`<div>1</div>`
		let maker1 = new TemplateMaker((_context: any) => {
			let t = t1()
			let div = t.content.firstElementChild!

			return {
				el: t,
				position: new SlotPosition(SlotPositionType.Before, div),
			}
		})

		let container = document.createElement('div')
		let pos1 = new SlotPosition(SlotPositionType.AfterContent, container)
		let slot = new TemplateSlot<any>(pos1 as SlotPosition<any>, null)
		let result = new CompiledTemplateResult(maker1, [])
		let text = document.createTextNode('3')

		slot.update(result)
		await UpdateQueue.untilComplete()
		expect(container.textContent).toBe('1')

		slot.update([result, result])
		await UpdateQueue.untilComplete()
		expect(container.textContent).toBe('11')

		slot.update('2')
		await UpdateQueue.untilComplete()
		expect(container.textContent).toBe('2')

		slot.update(null)
		slot.updateNodesOnly([text])
		await UpdateQueue.untilComplete()
		expect(container.textContent).toBe('3')
	})
})