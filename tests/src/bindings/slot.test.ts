import {UpdateQueue} from '@pucelle/ff'
import * as lupos from '../../../'


describe('Test :slot', () => {

	test('Named :slot', async () => {
		class Parent extends lupos.Component {
			protected render() {
				return lupos.html`<Child><div :slot="slotName">Slot Default Content</div></Child>`
			}
		}
		
		class Child extends lupos.Component {
			protected render() {
				return lupos.html`<slot name="slotName" />`
			}
		}

		
		let parent = new Parent()
		parent.appendTo(document.body)
		await UpdateQueue.untilComplete()
		expect(parent.el.querySelector('slot > *')).toBeInstanceOf(HTMLElement)
	})


	test('Named :slot toggling', async () => {
		class Parent extends lupos.Component {
			prop: boolean = true
			protected render() {
				return lupos.html`<Child>${this.prop ? lupos.html`<div :slot="slotName">Slot Content</div>` : null}</Child>`
			}
		}

		class Child extends lupos.Component {
			protected render() {
				return lupos.html`<slot name="slotName">Default Slot Content</slot>`
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
		class Parent extends lupos.Component {
			protected render() {
				return lupos.html`<Child><div>Slot Content</div></Child>`
			}
		}

		class Child extends lupos.Component {

			protected render() {
				return lupos.html`<slot />`
			}
		}

		let parent = new Parent()
		parent.appendTo(document.body)
		await UpdateQueue.untilComplete()
		expect(parent.el.querySelector('slot')?.textContent).toBe('Slot Content')
	})
})