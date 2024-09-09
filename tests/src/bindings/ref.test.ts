import {UpdateQueue} from '@pucelle/ff'
import {Component, html} from '../../../'


describe('Test :ref', () => {
	test(':ref component', async () => {
		class Parent extends Component {
			ref!: Child
			protected render() {
				return html`<Child :ref=${this.ref} />`
			}
		}

		class Child extends Component {}


		let p = new Parent()
		p.appendTo(document.body)
		await UpdateQueue.untilComplete()

		expect(p.ref).toBeInstanceOf(Child)
	})


	test(':ref element & toggling', async () => {
		class Com extends Component {
			ref!: HTMLElement | null
			prop: boolean = true

			protected render() {
				return this.prop ? html`<div :ref=${this.ref} />` : null
			}
		}


		let c = new Com()
		c.appendTo(document.body)
		await UpdateQueue.untilComplete()

		expect(c.ref).toBeInstanceOf(HTMLElement)

		c.prop = false
		await UpdateQueue.untilComplete()
		expect(c.ref).toEqual(null)

		c.prop = true
		await UpdateQueue.untilComplete()
		expect(c.ref).toBeInstanceOf(HTMLElement)
	})
})