import {setContext, untilUpdateComplete, useContext} from '@pucelle/ff'
import * as lupos from '../../../'


describe('Test Context Variable', () => {

	test('useContext & setContext', async () => {
		class Parent extends lupos.Component {

			@setContext
			prop: number = 1

			protected render() {
				return lupos.html`<Child />`
			}
		}

		class Child extends lupos.Component {

			@useContext prop!: number
		}


		let parent = new Parent()
		parent.appendTo(document.body)

		await untilUpdateComplete()
		let child = Child.fromClosest(parent.el.firstElementChild!)!
		expect(child.prop).toBe(1)

		parent.prop = 2
		expect(child.prop).toBe(2)

		parent.remove()
		await untilUpdateComplete()
		expect(child.prop).toBe(undefined)
	})
})
