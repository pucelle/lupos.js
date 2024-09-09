import {UpdateQueue} from '@pucelle/ff'
import * as lupos from '../../../'


describe('Test For Block', () => {
	let render = (list: number[]) => {
		return lupos.html`
			<lupos:for ${list}>${(item: number) => lupos.html`
				<div>${item}</div>
			`}</lupos:if>
		`
	}


	let container = document.createElement('div')
	let slot = new lupos.TemplateSlot(new lupos.SlotPosition(lupos.SlotPositionType.AfterContent, container), null)


	test('For Block', async () => {

		slot.update(render([1]))
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('1')

		slot.update(render([1, 2]))
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('12')

		slot.update(render([2, 3]))
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('23')

		slot.update(render([]))
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('')
	})


	test('For Block with Random Data', async () => {
		for (let i = 0; i < 10; i++) {
			let list: number[] = []
			list.push(Math.floor(Math.random() * 10))

			slot.update(render(list))
			await UpdateQueue.untilComplete()
			expect(container.textContent).toEqual(list.join(''))
		}
	})
})