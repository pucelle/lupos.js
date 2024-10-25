import * as lupos from '../../../'


describe('Test Template', () => {

	test('Template Content Order', async () => {
		let result = lupos.html`<div>1</div><div>2</div>` as any as lupos.CompiledTemplateResult

		let t = result.maker.make(null)
		expect(t.el.localName).toBe('template')
		expect(t.getFirstNode()?.textContent).toBe('1')

		let container = document.createElement('div')
		let pos1 = new lupos.SlotPosition(lupos.SlotPositionType.AfterContent, container)
		t.insertNodesBefore(pos1)

		// Appended to container
		expect(t.el.content.textContent).toBe('')
		expect(container.textContent).toBe('12')

		// Recycle nodes to template content
		await t.recycleNodes()
		expect(t.el.content.textContent).toBe('12')
		expect(container.textContent).toBe('')

		// Append new content to container
		let div = document.createElement('div')
		div.textContent = '3'
		container.append(div)
		let pos2 = new lupos.SlotPosition(lupos.SlotPositionType.Before, div)

		// Restore template content before position
		t.insertNodesBefore(pos2)
		expect(t.el.content.textContent).toBe('')
		expect(container.textContent).toBe('123')

		// Recycle nodes to template content again
		await t.recycleNodes()
		expect(t.el.content.textContent).toBe('12')
		expect(container.textContent).toBe('3')

		// Create another container
		t.insertNodesBefore(pos1)
		let container2 = document.createElement('div')
		let div2 = document.createElement('div')
		container2.append(div2)
		let pos3 = new lupos.SlotPosition(lupos.SlotPositionType.Before, div2)

		// Move nodes to another container
		t.moveNodesBefore(pos3)
		expect(container.textContent).toBe('3')
		expect(container2.textContent).toBe('12')
	})
})