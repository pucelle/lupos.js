import {DOMEvents, UpdateQueue, sleep} from '@pucelle/ff'
import {Component, TransitionOptions, defineTransition, html} from '../../../'
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
		class Com extends Component {

			prop: boolean = false

			protected render() {
				return this.prop ? html`<div :transition.immediate=${fade}>Transition...` : null
			}
		}


		let com = new Com()
		com.appendTo(document.body)
		await UpdateQueue.untilComplete()
		expect(com.el.firstElementChild).toBe(null)


		com.prop = true
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