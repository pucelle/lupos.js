import {UpdateQueue} from '@pucelle/ff'
import * as lupos from '../../../out'


describe('Test Switch Block', () => {
	test('Switch Block', async () => {
		let render = (value: number) => {
			return lupos.html`
				<lupos:switch ${value}>
					<lupos:case ${1}>1</lupos:case>
				</lupos:switch>
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

	test('Switch with Default Block', async () => {
		let render = (value: number) => {
			return lupos.html`
				<lupos:switch ${value}>
					<lupos:case ${1}>1</lupos:case>
					<lupos:case ${2}>2</lupos:case>
					<lupos:default>3</lupos:default>
				</lupos:switch>
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

	
	test('Switch Cacheable Block', async () => {
		let render = (value: number) => {
			return lupos.html`
				<lupos:switch ${value}>
					<lupos:case ${1}><div>1</div></lupos:case>
					<lupos:case ${2}><div>2</div></lupos:case>
				</lupos:switch>
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