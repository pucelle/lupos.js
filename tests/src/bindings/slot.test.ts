import {UpdateQueue} from '@pucelle/ff'
import {Component, html} from '../../../'


describe('Test :slot', () => {

	test('Named :slot', async () => {
		class Parent extends Component {
			protected render() {
				return html`<Child><div :slot="slotName">Slot Default Content</div></Child>`
			}
		}
		
		class Child extends Component {
			protected render() {
				return html`<slot name="slotName" />`
			}
		}

		
		let parent = new Parent()
		parent.appendTo(document.body)
		await UpdateQueue.untilComplete()
		expect(parent.el.querySelector('slot > *')).toBeInstanceOf(HTMLElement)
	})


	test('Named :slot toggling', async () => {
		class Parent extends Component {
			prop: boolean = true
			protected render() {
				return html`<Child>${this.prop ? html`<div :slot="slotName">Slot Content</div>` : null}</Child>`
			}
		}

		class Child extends Component {
			protected render() {
				return html`<slot name="slotName">Default Slot Content</slot>`
			}
		}


		let parent = new Parent()
		parent.appendTo(document.body)
		await UpdateQueue.untilComplete()
		expect(parent.el.querySelector('slot')?.textContent).toBe('Slot Content')

		parent.prop = false
		await UpdateQueue.untilComplete()
		expect(parent.el.querySelector('slot')?.textContent).toEqual('Default Slot Content')

		parent.prop = true
		await UpdateQueue.untilComplete()
	
		expect(parent.el.querySelector('slot')?.textContent).toBe('Slot Content')
	})


	test('Rest Slot', async () => {
		class Parent extends Component {
			protected render() {
				return html`<Child><div>Slot Content</div></Child>`
			}
		}

		class Child extends Component {

			protected render() {
				return html`<slot />`
			}
		}

		let parent = new Parent()
		parent.appendTo(document.body)
		await UpdateQueue.untilComplete()
		expect(parent.el.querySelector('slot')?.textContent).toBe('Slot Content')
	})
})