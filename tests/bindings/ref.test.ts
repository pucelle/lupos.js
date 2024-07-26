import {UpdateQueue, trackGet, trackSet} from '@pucelle/ff'
import {CompiledTemplateResult, Component, RefBinding, SlotPositionType, TemplateMaker, SlotPosition, createHTMLTemplateFn} from '../../src'


describe('Test :ref', () => {
	test(':ref=${refCom}', async () => {
		let t1 = createHTMLTemplateFn('')

		// Compile from `<Child :ref=${this.ref}>`
		let maker = new TemplateMaker((context: Parent) => {
			let t = t1() 
			let child = new Child()
			let b = new RefBinding(child.el)

			t.content.append(child.el)

			// Static updates move to here.
			b.update((r: any) => context.ref = r)

			return {
				el: t,
				position: new SlotPosition(SlotPositionType.Before, child.el),
				parts: [[b, 1]],
			}
		})


		class Parent extends Component {
			ref!: Child

			protected render() {
				return new CompiledTemplateResult(maker, [])
			}
		}


		class Child extends Component {}


		let p = new Parent()
		p.appendTo(document.body)
		await UpdateQueue.untilComplete()

		expect(p.ref).toBeInstanceOf(Child)
	})


	test(':ref element & toggling', async () => {
		let t1 = createHTMLTemplateFn('<div></div>')

		// Compile from `<div :ref=${this.ref}>`
		let maker = new TemplateMaker((context: C) => {
			let t = t1() 
			let div = t.content.firstChild as HTMLElement
			let b = new RefBinding(div)

			t.content.append(div)

			// Static updates move to here.
			b.update((r: any) => context.ref = r)

			return {
				el: t,
				position: new SlotPosition(SlotPositionType.Before, div),
				parts: [[b, 1]],
			}
		})

		class C extends Component {
			ref!: HTMLElement | null
			prop: boolean = true

			protected render() {
				trackGet(this, 'prop')
				return this.prop ? new CompiledTemplateResult(maker, []) : null
			}
		}


		let c = new C()
		c.appendTo(document.body)
		await UpdateQueue.untilComplete()

		expect(c.ref).toBeInstanceOf(HTMLElement)

		c.prop = false
		trackSet(c, 'prop')
		await UpdateQueue.untilComplete()
		expect(c.ref).toEqual(null)

		c.prop = true
		trackSet(c, 'prop')
		await UpdateQueue.untilComplete()
		expect(c.ref).toBeInstanceOf(HTMLElement)
	})
})