import {DOMEvents, UpdateQueue, sleep} from '@pucelle/ff'
import * as lupos from '../../../'
import {jest} from '@jest/globals'


describe('Test :transition', () => {

	// Jest env has no web animation API.
	const perFrameFade = lupos.defineTransition(function(el: HTMLElement, options: lupos.TransitionOptions = {}) {
		return {
			...options,
			perFrame: (progress: number) => {
				el.style.opacity = progress + ''
			},
		}
	})

	test(':transition=${...}', async () => {
		class Com extends lupos.Component {

			prop: boolean = false

			protected render() {
				return this.prop ? lupos.html`<div :transition.immediate=${perFrameFade()}>Transition...` : null
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

		// Enter transition from 0 to 1
		await sleep(100)
		expect(Number(div.style.opacity)).toBeGreaterThan(0)
		expect(Number(div.style.opacity)).toBeLessThan(1)

		// Enter Transition end
		await sleep(120)
		expect(Number(div.style.opacity)).toEqual(1)
		expect(fn2).toHaveBeenCalledTimes(1)

		// Leave transition started
		com.prop = false
		await UpdateQueue.untilComplete()
		expect(fn3).toHaveBeenCalledTimes(1)

		// Leave transition from 1 to 0
		await sleep(100)
		expect(Number(div.style.opacity)).toBeGreaterThan(0)
		expect(Number(div.style.opacity)).toBeLessThan(1)

		// Leave transition end
		await sleep(120)
		expect(com.el.firstElementChild).toBe(null)
		expect(fn4).toHaveBeenCalledTimes(1)
	})
})