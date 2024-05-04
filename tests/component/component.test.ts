import {UpdateQueue} from '@pucelle/ff'
import {Component, css} from '../../src'
import {jest} from '@jest/globals'


describe('Test Component', () => {

	test('Component apis', async () => {
		class Parent extends Component {

			static style() {
				return css`.className{color: red;}`
			}

			protected render() {
				return null
			}
		}

		class Child extends Component {

			protected render() {
				return null
			}
		}


		let parent = new Parent()
		let child = new Child()
		let fn1 = jest.fn()
		let fn2 = jest.fn()
		let fn3 = jest.fn()

		parent.on('updated', fn1)
		parent.on('connected', fn2)
		parent.on('disconnected', fn3)

		expect(parent.connected).toBe(false)


		parent.el.append(child.el)
		parent.appendTo(document.body)

		await UpdateQueue.untilComplete()
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