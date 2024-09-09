import {UpdateQueue} from '@pucelle/ff'
import * as lupos from '../../../'


describe('Test If Block', () => {
	test('If Block', async () => {
		let render = (value: number) => {
			return lupos.html`
				<lupos:if ${value === 1}>1</lupos:if>
			`
		}

		let container = document.createElement('div')
		let slot = new lupos.TemplateSlot<null>(new lupos.SlotPosition(lupos.SlotPositionType.AfterContent, container), null)

		slot.update(render(1))
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('1')

		slot.update(render(2))
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('')
	})

	
	test('If Else Block', async () => {
		let render = (value: number) => {
			return lupos.html`
				<lupos:if ${value === 1}>1</lupos:if>
				<lupos:elseif ${value === 2}>2</lupos:elseif>
				<lupos:else>3</lupos:else>
			`
		}

		let container = document.createElement('div')
		let slot = new lupos.TemplateSlot<null>(new lupos.SlotPosition(lupos.SlotPositionType.AfterContent, container), null)

		slot.update(render(1))
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('1')

		slot.update(render(2))
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('2')

		slot.update(render(3))
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('3')
	})


	test('If Else Cacheable Block', async () => {
		let render = (value: number) => {
			return lupos.html`
				<lupos:if ${value === 1} cache><div>1</div></lupos:if>
				<lupos:else><div>2</div></lupos:else>
			`
		}

		let container = document.createElement('div')
		let slot = new lupos.TemplateSlot<null>(new lupos.SlotPosition(lupos.SlotPositionType.AfterContent, container), null)

		slot.update(render(1))
		await UpdateQueue.untilComplete()
		let div = container.firstElementChild
		expect(container.textContent).toEqual('1')

		slot.update(render(2))
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('2')
		expect(container.firstElementChild === div).toEqual(false)

		slot.update(render(1))
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('1')
		expect(container.firstElementChild).toEqual(div)
	})
})