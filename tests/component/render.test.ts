import {DependencyTracker, UpdateQueue} from '@pucelle/ff'
import {CompiledTemplateResult, TemplateMaker, SlotPosition, SlotPositionType, createHTMLTemplateFn, render} from '../../src'


describe('Test render', () => {

	test('Render Static', async () => {
		let t1 = createHTMLTemplateFn(`<div>123</div>`)

		// Compile from `<div>123</div>`
		let maker = new TemplateMaker((_context: any) => {
			let t = t1()
			let div = t.content.firstElementChild!

			return {
				el: t,
				position: new SlotPosition(SlotPositionType.Before, div),
			}
		})

		
		let r = render(new CompiledTemplateResult(maker, []))
		r.appendTo(document.body)
		await UpdateQueue.untilComplete()
		expect(r.el.innerHTML).toBe(`<div>123</div>`)
	})


	test('Render Dynamic', async () => {
		let t1 = createHTMLTemplateFn(`<div> </div>`)

		// Compile from `<div>${...}</div>`
		let maker = new TemplateMaker((_context: any) => {
			let t = t1()
			let div = t.content.firstElementChild!
			let text = div.firstChild as Text

			return {
				el: t,
				update(values: any[]) {
					text.data = values[0]
				},
				position: new SlotPosition(SlotPositionType.Before, div),
			}
		})

		let o = {value: 1}

		let r = render(() => {
			DependencyTracker.onGet(o, 'value')
			return new CompiledTemplateResult(maker, [o.value])
		})

		r.appendTo(document.body)
		await UpdateQueue.untilComplete()
		expect(r.el.innerHTML).toBe(`<div>1</div>`)

		o.value = 2
		DependencyTracker.onSet(o, 'value')
		await UpdateQueue.untilComplete()
		expect(r.el.innerHTML).toBe(`<div>2</div>`)
	})
})