import {UpdateQueue} from '@pucelle/ff'
import {Component, TemplateMaker, TemplateSlot, TemplateSlotPosition, TemplateSlotPositionType, createSwitchBlockFn, createHTMLTemplateFn} from '../../src'


describe('Test Switch Block', () => {
	test('switch block', async () => {
		let t1 = createHTMLTemplateFn('<div>1</div>')
		let t2 = createHTMLTemplateFn('<div>2</div>')
		let t3 = createHTMLTemplateFn('<div>3</div>')

		// Compile from `<div>...</div>`
		let maker1 = new TemplateMaker((_context: Component) => {
			let t = t1()
			let div = t.content.firstElementChild!
			
			return {
				el: t,
				position: new TemplateSlotPosition(TemplateSlotPositionType.Before, div),
			}
		})

		let maker2 = new TemplateMaker((_context: Component) => {
			let t = t2()
			let div = t.content.firstElementChild!
			
			return {
				el: t,
				position: new TemplateSlotPosition(TemplateSlotPositionType.Before, div),
			}
		})

		let maker3 = new TemplateMaker((_context: Component) => {
			let t = t3()
			let div = t.content.firstElementChild!
			
			return {
				el: t,
				position: new TemplateSlotPosition(TemplateSlotPositionType.Before, div),
			}
		})

		let block = createSwitchBlockFn((values: any[]) => {
			if (values[0]) {
				return 0
			}
			else if (values[1]) {
				return 1
			}
			else {
				return 2
			}
		},[
			maker1,
			maker2,
			maker3
		])

		let container = document.createElement('div')
		let s = new TemplateSlot(new TemplateSlotPosition(TemplateSlotPositionType.AfterContent, container), null)
		let b = block(s, null)

		b.update([1, 1, 1])
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('1')

		b.update([0, 1, 1])
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('2')

		b.update([0, 0, 1])
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('3')
	})
})