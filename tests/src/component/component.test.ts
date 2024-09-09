import {UpdateQueue} from '@pucelle/ff'
import {Component, css, html} from '../../../'
import {jest} from '@jest/globals'


describe('Test Component', () => {

	test('Component Apis', async () => {
		class Parent extends Component {

			static style() {
				return css`.className{color: red;}`
			}

			protected render() {
				return html`<Child />`
			}
		}

		class Child extends Component {}


		let parent = new Parent()
		let fn1 = jest.fn()
		let fn2 = jest.fn()
		let fn3 = jest.fn()

		parent.on('updated', fn1)
		parent.on('connected', fn2)
		parent.on('disconnected', fn3)
		expect(parent.connected).toBe(false)

		parent.appendTo(document.body)
		await UpdateQueue.untilComplete()
		let child = Child.fromClosest(parent.el.firstElementChild!)!

		expect(fn1).toHaveBeenCalledTimes(1)
		expect(fn2).toHaveBeenCalledTimes(1)

		expect(Component.from(parent.el)).toBe(parent)
		expect(Component.from(child.el)).toBe(child)

		expect(Component.fromClosest(child.el)).toBe(child)
		expect(Child.fromClosest(child.el)).toBe(child)
		expect(Parent.fromClosest(child.el)).toBe(parent)

		expect(parent.connected).toBe(true)
		expect(document.head.querySelector('style')?.textContent).toBe('.className{color: red;}')

		parent.remove()
		expect(parent.connected).toBe(false)
		expect(fn3).toHaveBeenCalledTimes(1)
	})
})