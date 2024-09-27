import {untilComplete} from '@pucelle/ff'
import * as lupos from '../../../'


describe('Test :ref', () => {
	test(':ref component', async () => {
		class Parent extends lupos.Component {
			ref!: Child
			protected render() {
				return lupos.html`<Child :ref=${this.ref} />`
			}
		}

		class Child extends lupos.Component {}


		let p = new Parent()
		p.appendTo(document.body)
		await untilComplete()

		expect(p.ref).toBeInstanceOf(Child)
	})


	test(':ref element & toggling', async () => {
		class Com extends lupos.Component {
			ref!: HTMLElement | null
			prop: boolean = true

			protected render() {
				return this.prop ? lupos.html`<div :ref=${this.ref} />` : null
			}
		}


		let c = new Com()
		c.appendTo(document.body)
		await untilComplete()

		expect(c.ref).toBeInstanceOf(HTMLElement)

		c.prop = false
		await untilComplete()
		expect(c.ref).toEqual(null)

		c.prop = true
		await untilComplete()
		expect(c.ref).toBeInstanceOf(HTMLElement)
	})
})