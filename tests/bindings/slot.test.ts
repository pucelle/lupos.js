import {UpdateQueue, trackGet, trackSet} from '@pucelle/ff'
import {CompiledTemplateResult, Component, SlotBinding, SlotPositionType, TemplateMaker, SlotPosition, DynamicTypedTemplateSlot, createHTMLTemplateFn, TemplateSlot} from '../../src'
import {SlotRange} from '../../src/template/slot-range'


describe('Test :slot', () => {

	test(':slot', async () => {
		let t1 = createHTMLTemplateFn('')
		let t2 = createHTMLTemplateFn('<div>Slot Content</div>')

		// Compile from `<Child><div :slot="slotName">Slot Content...`
		let maker1 = new TemplateMaker((_context: Parent) => {
			let t = t1()
			let child = new Child()
			let c = document.createComment('')
			let content = t2()
			let e = content.content.firstElementChild!

			child.el.append(content.content)
			child.el.prepend(c)
			t.content.append(child.el)

			let b = new SlotBinding(e)

			// Static updates move to here.
			b.update('slotName')

			return {
				el: t,
				position: new SlotPosition(SlotPositionType.Before, c),
				parts: [[child, 3], [b, 1]],
			}
		})

		let t3 = createHTMLTemplateFn('<slot></slot>')

		// Compile from `<slot name="slotName">...`
		let maker2 = new TemplateMaker((context: Child) => {
			let t = t3()
			let s = t.content.firstElementChild!

			let slot = new DynamicTypedTemplateSlot<null>(
				new SlotPosition(SlotPositionType.AfterContent, s),
				context
			)

			return {
				el: t,
				position: new SlotPosition(SlotPositionType.Before, s),
				update: (values: any[]) => {
					slot.update(values[0])
				},
				parts: [[slot, 1]],
			}
		})

		class Parent extends Component {

			// Renders html`<Child><div :slot="slotName" /></Child>`
			protected render() {
				return new CompiledTemplateResult(maker1, [])
			}
		}

		class Child extends Component {

			// Renders html`<slot name="slotName" />`
			protected render() {
				return new CompiledTemplateResult(maker2, [this.__getSlotElement('slotName')])
			}
		}

		let parent = new Parent()
		parent.appendTo(document.body)
		await UpdateQueue.untilComplete()
		expect(parent.el.querySelector('slot > *')).toBeInstanceOf(HTMLElement)
	})


	test(':slot toggling', async () => {
		let t1 = createHTMLTemplateFn('')

		// Compile from `<Child>${...}...`
		let maker1 = new TemplateMaker((context: Parent) => {
			let t = t1()
			let c = document.createComment('')
			let child = new Child()

			let slot = new TemplateSlot(

				// End of component cant be located, because may append new contents.
				new SlotPosition(SlotPositionType.Before, c),
				context,
			)
			
			child.el.append(c)
			t.content.append(child.el)

			return {
				el: t,
				position: new SlotPosition(SlotPositionType.Before, child.el),
				update: (values: any[]) => {
					slot.update(values[0])
				},
				parts: [[child, 3], [slot, 1]],
			}
		})

		let t2 = createHTMLTemplateFn('<!----><div>Slot Content</div>')

		// Compile from `<div :slot="slotName">...`
		let maker2 = new TemplateMaker((_context: Parent) => {
			let t = t2()
			let c = t.content.firstChild!
			let div = t.content.firstElementChild!
			let b = new SlotBinding(div)

			// Static updates move to here.
			b.update('slotName')

			return {
				el: t,

				// the slot element cant be located, so nothing inside. 
				position: new SlotPosition(SlotPositionType.Before, c),

				parts: [[b, 1]],
			}
		})

		let t3 = createHTMLTemplateFn('<slot></slot>')

		// Compile from `<slot name="slotName">Default`
		let maker3 = new TemplateMaker((context: Child) => {
			let t = t3()
			let s = t.content.firstElementChild!

			let slot = new DynamicTypedTemplateSlot(
				new SlotPosition(SlotPositionType.AfterContent, s),
				context,
			)

			return {
				el: t,
				position: new SlotPosition(SlotPositionType.Before, s),
				update: (values: any[]) => {
					slot.update(values[0] || new CompiledTemplateResult(maker4, []))
				},
				parts: [[slot, 1]],
			}
		})

		let t4 = createHTMLTemplateFn('Default Content')

		// Compile from `Default Content`
		let maker4 = new TemplateMaker((_context: Child) => {
			let t = t4()
			let text = t.content.firstChild!

			return {
				el: t,
				position: new SlotPosition(SlotPositionType.Before, text),
			}
		})

		class Parent extends Component {
			prop: boolean = true

			// Renders html`<Child>${this.prop ? html`<div :slot="slotName" />` : null}</Child>`
			protected render() {
				trackGet(this, 'prop')
				return new CompiledTemplateResult(maker1, [
					this.prop ? new CompiledTemplateResult(maker2, []) : null
				])
			}
		}

		class Child extends Component {

			// Renders html`<slot name="slotName" />`
			protected render() {
				return new CompiledTemplateResult(maker3, [this.__getSlotElement('slotName')])
			}
		}


		let parent = new Parent()
		parent.appendTo(document.body)
		await UpdateQueue.untilComplete()
		expect(parent.el.querySelector('slot')?.textContent).toBe('Slot Content')

		parent.prop = false
		trackSet(parent, 'prop')
		await UpdateQueue.untilComplete()
		expect(parent.el.querySelector('slot')?.textContent).toEqual('Default Content')

		parent.prop = true
		trackSet(parent, 'prop')
		await UpdateQueue.untilComplete()
	
		expect(parent.el.querySelector('slot')?.textContent).toBe('Slot Content')
	})


	test('Rest Slot', async () => {
		let t1 = createHTMLTemplateFn('')
		let t2 = createHTMLTemplateFn('SlotContent')

		// Compile from `<Child>SlotContent`
		let maker1 = new TemplateMaker((_context: Parent) => {
			let t = t1()
			let child = new Child()
			let content = t2()
			let text = content.content.firstChild!

			child.el.append(content.content)
			t.content.append(child.el)

			let p = new SlotPosition<SlotPositionType.Before>(SlotPositionType.Before, text)
			let r = new SlotRange(p, text)
			child.__applyRestSlotRange(r)

			return {
				el: t,
				position: new SlotPosition(SlotPositionType.Before, child.el),
				parts: [[child, 3]],
			}
		})

		let t3 = createHTMLTemplateFn('<slot></slot>')

		// Compile from `<slot>...`
		let maker2 = new TemplateMaker((context: Child) => {
			let t = t3()
			let s = t.content.firstElementChild!

			// Rest slot nodes is static, so move it to here.
			s.append(...context.__getRestSlotNodes())

			return {
				el: t,
				position: new SlotPosition(SlotPositionType.Before, s),
			}
		})

		class Parent extends Component {

			// Renders html`<Child><div :slot="slotName" /></Child>`
			protected render() {
				return new CompiledTemplateResult(maker1, [])
			}
		}

		class Child extends Component {

			protected render() {
				return new CompiledTemplateResult(maker2, [])
			}
		}

		let parent = new Parent()
		parent.appendTo(document.body)
		await UpdateQueue.untilComplete()
		expect(parent.el.querySelector('slot')?.textContent).toBe('SlotContent')
	})
})