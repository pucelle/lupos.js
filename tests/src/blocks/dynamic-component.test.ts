import {UpdateQueue} from '@pucelle/ff'
import {Component, html, RenderResult} from '../../../'


describe('Test Dynamic Component Block', () => {
	test('Dynamic Child Component', async () => {
		class Parent extends Component {

			ChildCom: any = Child1

			protected render() {
				return html`<${this.ChildCom} :class="${'className'}">Child Component Content</>`
			}
		}

		class Child1 extends Component {
			protected render() {
				return html`<slot />`
			}
		}
		class Child2 extends Component {
			protected render() {
				return html`<slot />`
			}
		}

		let parent = new Parent()
		parent.appendTo(document.body)
		await UpdateQueue.untilComplete()

		let child1 = Child1.from(parent.el.firstElementChild!)!
		expect(child1).toBeInstanceOf(Child1)
		expect(child1.connected).toBe(true)
		expect(parent.el.textContent).toBe('Child Component Content')

		parent.ChildCom = Child2
		await UpdateQueue.untilComplete()
		expect(child1.connected).toBe(false)
		expect(Child2.from(parent.el.firstElementChild!)).toBeInstanceOf(Child2)
		expect(parent.el.textContent).toBe('Child Component Content')
	})
})