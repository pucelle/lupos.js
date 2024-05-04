import {UpdateQueue} from '@pucelle/ff'
import {CompiledTemplateResult, Component, TemplateMaker, DynamicTypedTemplateSlot, SlotPosition, SlotPositionType, createForBlockFn, createHTMLTemplateFn} from '../../src'


describe('Test For Block', () => {
	test('for block', async () => {
		let t1 = createHTMLTemplateFn('<div> </div>')

		// Compile from `<div>${}</div>`
		let maker1 = new TemplateMaker((_context: Component) => {
			let t = t1()
			let div = t.content.firstElementChild!
			let text = div.firstChild as Text

			// knows it's inner content could only be text.
			// let s = new DynamicTypedTemplateSlot(new SlotPosition(SlotPositionType.AfterContent, div), context)
			
			return {
				el: t,
				position: new SlotPosition(SlotPositionType.Before, div),
				update (values) {
					text.data = values[0]
				},

				// Remove it because knows it's inner content couldn't be parts.
				// parts: [[s, 1]],
			}
		})

		let block = createForBlockFn((item: any, _index) => {
			return new CompiledTemplateResult(maker1, [item])
		})

		let container = document.createElement('div')
		let s = new DynamicTypedTemplateSlot(new SlotPosition(SlotPositionType.AfterContent, container), null)
		let b = block(s, null)

		b.update([1])
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('1')

		b.update([1, 2])
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('12')

		b.update([2, 3])
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('23')

		b.update([])
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('')

		// Random date test.
		for (let i = 0; i < 10; i++) {
			let a: number[] = []
			a.push(Math.floor(Math.random() * 10))

			b.update(a)
			await UpdateQueue.untilComplete()
			expect(container.textContent).toEqual(a.join(''))
		}
	})
})