import {UpdateQueue} from '@pucelle/ff'
import {Component, TemplateMaker, TemplateSlot, TemplateSlotPosition, TemplateSlotPositionType, createAwaitBlockFn, createHTMLTemplateFn} from '../../src'


describe('Test Await Block', () => {
	test('await block', async () => {
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

		let block = createAwaitBlockFn([
			maker1,
			maker2,
			maker3
		])

		let container = document.createElement('div')
		let s = new TemplateSlot(new TemplateSlotPosition(TemplateSlotPositionType.AfterContent, container), null)
		let b = block(s, null)


		let r: (value: any) => void

		let p = new Promise((resolve) => {
			r = resolve
		})

		b.update(p, [])
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('1')

		r!(undefined)
		await Promise.resolve()
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('2')


		p = new Promise((_resolve, reject) => {
			r = reject
		})

		b.update(p, [])
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('1')

		r!(undefined)
		await Promise.resolve()
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('3')
	})
})