import {untilUpdateComplete} from '@pucelle/ff'
import * as lupos from '../../../out'


describe('Test Switch Block', () => {
	test('Switch Block', async () => {
		let render = (value: number) => {
			return lupos.html`
				<lu:switch ${value}>
					<lu:case ${1}>1</lu:case>
				</lu:switch>
			`
		}

		let container = document.createElement('div')
		let slot = new lupos.TemplateSlot<null>(new lupos.SlotPosition(lupos.SlotPositionType.AfterContent, container), null)

		slot.update(render(1))
		await untilUpdateComplete()
		expect(container.textContent).toEqual('1')

		slot.update(render(2))
		await untilUpdateComplete()
		expect(container.textContent).toEqual('')
	})

	test('Switch with Default Block', async () => {
		let render = (value: number) => {
			return lupos.html`
				<lu:switch ${value}>
					<lu:case ${1}>1</lu:case>
					<lu:case ${2}>2</lu:case>
					<lu:default>3</lu:default>
				</lu:switch>
			`
		}

		let container = document.createElement('div')
		let slot = new lupos.TemplateSlot<null>(new lupos.SlotPosition(lupos.SlotPositionType.AfterContent, container), null)

		slot.update(render(1))
		await untilUpdateComplete()
		expect(container.textContent).toEqual('1')

		slot.update(render(2))
		await untilUpdateComplete()
		expect(container.textContent).toEqual('2')

		slot.update(render(3))
		await untilUpdateComplete()
		expect(container.textContent).toEqual('3')
	})

	
	test('Switch Cacheable Block', async () => {
		let render = (value: number) => {
			return lupos.html`
				<lu:switch ${value}>
					<lu:case ${1}><div>1</div></lu:case>
					<lu:case ${2}><div>2</div></lu:case>
				</lu:switch>
			`
		}

		let container = document.createElement('div')
		let slot = new lupos.TemplateSlot<null>(new lupos.SlotPosition(lupos.SlotPositionType.AfterContent, container), null)

		slot.update(render(1))
		await untilUpdateComplete()
		let div = container.firstElementChild
		expect(container.textContent).toEqual('1')

		slot.update(render(2))
		await untilUpdateComplete()
		expect(container.textContent).toEqual('2')
		expect(container.firstElementChild === div).toEqual(false)

		slot.update(render(1))
		await untilUpdateComplete()
		expect(container.textContent).toEqual('1')
		expect(container.firstElementChild).toEqual(div)
	})
})