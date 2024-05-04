import {SlotPositionType, TemplateMaker, SlotPosition, createHTMLTemplateFn, DynamicTypedTemplateSlot} from '../../src'


describe('Test Template', () => {

	test('Template content order', async () => {
		let t1 = createHTMLTemplateFn('<div>1</div><div>2</div>')

		// Compile from html`<div>1</div><div>2</div>`
		let maker1 = new TemplateMaker((_context: any) => {
			let t = t1()
			let div = t.content.firstElementChild!

			return {
				el: t,
				position: new SlotPosition(SlotPositionType.Before, div),
			}
		})

		let t = maker1.make(null)
		expect(t.el.localName).toBe('template')
		expect(t.getFirstNode()?.textContent).toBe('1')

		let container = document.createElement('div')
		let pos1 = new SlotPosition(SlotPositionType.AfterContent, container)
		t.insertNodesBefore(pos1)

		expect(t.el.content.textContent).toBe('')
		expect(container.textContent).toBe('12')

		await t.recycleNodes()
		expect(t.el.content.textContent).toBe('12')
		expect(container.textContent).toBe('')

		let div = document.createElement('div')
		div.textContent = '3'
		container.append(div)
		let pos2 = new SlotPosition(SlotPositionType.Before, div)

		t.insertNodesBefore(pos2)
		expect(t.el.content.textContent).toBe('')
		expect(container.textContent).toBe('123')

		await t.recycleNodes()
		expect(t.el.content.textContent).toBe('12')
		expect(container.textContent).toBe('3')

		let slot = new DynamicTypedTemplateSlot(pos2 as SlotPosition<any>, null)
		let pos3 = new SlotPosition(SlotPositionType.BeforeSlot, slot)

		t.insertNodesBefore(pos3)
		expect(t.el.content.textContent).toBe('')
		expect(container.textContent).toBe('123')

		await t.recycleNodes()
		expect(t.el.content.textContent).toBe('12')
		expect(container.textContent).toBe('3')

		t.insertNodesBefore(pos1)
		let container2 = document.createElement('div')
		let div2 = document.createElement('div')
		container2.append(div2)
		let pos4 = new SlotPosition(SlotPositionType.Before, div2)

		t.moveNodesBefore(pos4)
		expect(container.textContent).toBe('3')
		expect(container2.textContent).toBe('12')
	})
})