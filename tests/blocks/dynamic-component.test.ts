import {DependencyTracker, UpdateQueue} from '@pucelle/ff'
import {ClassBinding, CompiledTemplateResult, Component, SlotPosition, SlotPositionType, SlotRange, TemplateMaker, DynamicTypedTemplateSlot, createDynamicComponentBlockFn, createHTMLTemplateFn} from '../../src'


describe('Test Dynamic Component', () => {

	test('Dynamic Component', async () => {
		let t1 = createHTMLTemplateFn('<!----><!---->')
		let t2 = createHTMLTemplateFn('<div>Component Content</div>')

		let blockFn = createDynamicComponentBlockFn(
			function bindComFn(c: Component) {
				let b = new ClassBinding(c.el)

				return {
					update(values: any[]) {
						b.update(values[1])
					}
				}
			}
		)

		// Compile from `<${Com} :class="${...}"><div>Component Content</div></>`
		let maker1 = new TemplateMaker((context: Component) => {
			let t = t1()
			let comment1 = t.content.firstChild!
			let comment2 = t.content.lastChild!
			let content = t2()
			let div = content.content.firstElementChild!
			let startP = new SlotPosition<SlotPositionType.Before>(SlotPositionType.Before, comment1)
			let endP = new SlotPosition<SlotPositionType.Before>(SlotPositionType.Before, comment2)
			let slot = new DynamicTypedTemplateSlot<null>(endP, context)
			let p = new SlotPosition<SlotPositionType.Before>(SlotPositionType.Before, div)
			let contentRange = new SlotRange(p, div)
			let b = blockFn(slot, contentRange, context)

			return {
				el: t,
				position: startP,
				update (values) {
					b.update(values[0], values)
				},
			}
		})

		class Parent extends Component {

			childClass: any = Child1

			protected render() {
				DependencyTracker.onGet(this, 'childClass')
				return new CompiledTemplateResult(maker1, [this.childClass, 'className'])
			}
		}

		class Child1 extends Component {}
		class Child2 extends Component {}

		let parent = new Parent()
		parent.appendTo(document.body)
		await UpdateQueue.untilComplete()

		let child1 = Child1.from(parent.el.firstElementChild!)!
		expect(child1).toBeInstanceOf(Child1)
		expect(child1.connected).toBe(true)
		expect(parent.el.textContent).toBe('Component Content')

		parent.childClass = Child2
		DependencyTracker.onSet(parent, 'childClass')
		await UpdateQueue.untilComplete()
		expect(child1.connected).toBe(false)
		expect(Child2.from(parent.el.firstElementChild!)).toBeInstanceOf(Child2)
		expect(parent.el.textContent).toBe('Component Content')
	})
})