import {UpdateQueue} from '@pucelle/ff'
import * as lupos from '../../../'


describe('Test Await Block', () => {
	test('Await Block', async () => {
		let render = (promise: Promise<any>) => {
			return lupos.html`
				<lupos:await ${promise}>Pending</lupos:await>
				<lupos:then>Then</lupos:then>
				<lupos:catch>Catch</lupos:catch>
			`
		}

		let container = document.createElement('div')
		let slot = new lupos.TemplateSlot<null>(new lupos.SlotPosition(lupos.SlotPositionType.AfterContent, container), null)

		let resolve: (value: any) => void
		let promise = new Promise((r) => {
			resolve = r
		})

		slot.update(render(promise))
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('Pending')

		resolve!(null)
		await Promise.resolve()
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('Then')

		let reject: (reason: any) => void
		promise = new Promise((_r, r) => {
			reject = r
		})

		slot.update(render(promise))
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('Pending')

		reject!(null)
		await Promise.resolve()
		await UpdateQueue.untilComplete()
		expect(container.textContent).toEqual('Catch')
	})
})