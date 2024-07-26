import {DOMEvents, UpdateQueue, trackGet, trackSet, sleep} from '@pucelle/ff'
import {CompiledTemplateResult, Component, TemplateMaker, SlotPosition, SlotPositionType, TransitionBinding, TransitionOptions, createHTMLTemplateFn, defineTransition} from '../../src'
import {jest} from '@jest/globals'


describe('Test :transition', () => {

	const fade = defineTransition(function(el: HTMLElement, options: TransitionOptions = {}) {
		return {
			...options,
			perFrame: (progress: number) => {
				el.style.opacity = progress + ''
			},
		}
	})

	test(':transition=${...}', async () => {
		let t1 = createHTMLTemplateFn('<div>Transition</div>')

		// Compile from `<div :transition=${}>Transition...`
		let maker1 = new TemplateMaker((_context: Component) => {
			let t = t1()
			let div = t.content.firstElementChild!
			let b = new TransitionBinding(div)
			b.immediate = true

			// Static updates move to here.
			b.update(fade({duration: 200}))

			return {
				el: t,
				position: new SlotPosition(SlotPositionType.Before, div),
				parts: [[b, 3]],
			}
		})


		class Com extends Component {

			prop: boolean = false

			protected render() {
				trackGet(this, 'prop')
				return this.prop ? new CompiledTemplateResult(maker1, [this.slotElements.slotName]) : null
			}
		}


		let com = new Com()
		com.appendTo(document.body)
		await UpdateQueue.untilComplete()
		expect(com.el.firstElementChild).toBe(null)


		com.prop = true
		trackSet(com, 'prop')
		await UpdateQueue.untilComplete()

		let div = com.el.firstElementChild as HTMLElement
		let fn2 = jest.fn()
		let fn3 = jest.fn()
		let fn4 = jest.fn()
		DOMEvents.on(div, 'transition-enter-ended', fn2)
		DOMEvents.on(div, 'transition-leave-started', fn3)
		DOMEvents.on(div, 'transition-leave-ended', fn4)


		await sleep(100)
		expect(Number(div.style.opacity)).toBeGreaterThan(0)
		expect(Number(div.style.opacity)).toBeLessThan(1)

		await sleep(120)
		expect(Number(div.style.opacity)).toEqual(1)
		expect(fn2).toHaveBeenCalledTimes(1)


		com.prop = false
		trackSet(com, 'prop')
		await UpdateQueue.untilComplete()
		expect(fn3).toHaveBeenCalledTimes(1)

		await sleep(100)
		expect(Number(div.style.opacity)).toBeGreaterThan(0)
		expect(Number(div.style.opacity)).toBeLessThan(1)

		await sleep(120)
		expect(com.el.firstElementChild).toBe(null)
		expect(fn4).toHaveBeenCalledTimes(1)
	})
})