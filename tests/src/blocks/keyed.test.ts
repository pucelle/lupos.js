import {UpdateQueue} from '@pucelle/ff'
import * as lupos from '../../../'


describe('Test Keyed Block', () => {
	test('Keyed Block', async () => {
		let render = (value: number) => {
			return lupos.html`
				<lupos:keyed ${value}><div>${value}</div></lupos:if>
			`
		}

		let container = document.createElement('div')
		let slot = new lupos.TemplateSlot<null>(new lupos.SlotPosition(lupos.SlotPositionType.AfterContent, container), null)

		slot.update(render(1))
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('1')
		let keyedDiv = container.firstElementChild

		slot.update(render(1))
		await UpdateQueue.untilComplete()
		expect(container.firstElementChild).toEqual(keyedDiv)

		slot.update(render(2))
		await UpdateQueue.untilComplete()
		expect(container.firstElementChild === keyedDiv).toBe(false)
	})


	test('Keyed Cacheable Block', async () => {
		let render = (value: number) => {
			return lupos.html`
				<lupos:keyed ${value} cache><div>${value}</div></lupos:if>
			`
		}

		let container = document.createElement('div')
		let slot = new lupos.TemplateSlot<null>(new lupos.SlotPosition(lupos.SlotPositionType.AfterContent, container), null)

		slot.update(render(1))
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('1')
		let div = container.firstElementChild

		slot.update(render(2))
		await UpdateQueue.untilComplete()
		expect(container.firstElementChild === div).toBe(false)

		slot.update(render(1))
		await UpdateQueue.untilComplete()
		expect(container.firstElementChild).toEqual(div)
	})
})