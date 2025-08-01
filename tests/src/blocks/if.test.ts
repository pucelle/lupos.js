import {untilUpdateComplete} from '@pucelle/lupos'
import * as lupos from '../../../'


describe('Test If Block', () => {
	test('If Block', async () => {
		let render = (value: number) => {
			return lupos.html`
				<lu:if ${value === 1}>1</lu:if>
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

	
	test('If Else Block', async () => {
		let render = (value: number) => {
			return lupos.html`
				<lu:if ${value === 1}>1</lu:if>
				<lu:elseif ${value === 2}>2</lu:elseif>
				<lu:else>3</lu:else>
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


	test('If Else Cacheable Block', async () => {
		let render = (value: number) => {
			return lupos.html`
				<lu:if ${value === 1} cache><div>1</div></lu:if>
				<lu:else><div>2</div></lu:else>
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