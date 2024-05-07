import {UpdateQueue} from '@pucelle/ff'
import {Component, TemplateMaker, DynamicTypedTemplateSlot, SlotPosition, SlotPositionType, createKeyedBlockFn, createHTMLTemplateFn} from '../../src'


describe('Test Keyed Block', () => {
	test('if keyed', async () => {
		let t1 = createHTMLTemplateFn('<div>1</div>')

		// Compile from `<div>...</div>`
		let maker1 = new TemplateMaker((_context: Component) => {
			let t = t1()
			let div = t.content.firstElementChild!
			
			return {
				el: t,
				position: new SlotPosition(SlotPositionType.Before, div),
			}
		})

		let block = createKeyedBlockFn(maker1)

		let container = document.createElement('div')
		let s = new DynamicTypedTemplateSlot<null>(new SlotPosition(SlotPositionType.AfterContent, container), null)
		let b = block(s, null)

		b.update(1, [])
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('1')
		let div = container.firstElementChild

		b.update(1, [])
		await UpdateQueue.untilComplete()
		expect(container.firstElementChild === div).toBe(true)

		b.update(2, [])
		await UpdateQueue.untilComplete()
		expect(container.firstElementChild === div).toBe(false)
	})
})