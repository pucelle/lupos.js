import {PerFrameTransition, WebTransition, WebTransitionOptions} from '@pucelle/ff'
import {Binding, defineNamedBinding} from './define'
import {PerFrameTransitionProperties, TransitionProperties, TransitionResult, WebTransitionProperties} from './transitions'
import {Part, PartCallbackParameter} from '../types'


/** Transition type, enum of two. */
enum MixedTransitionType {
	PerFrame,
	Web,
}


/**
 * `:transition` binding can play transition animation after element connected or before disconnect.
 * - `<el :transition=${fade({duration, ...})}>`
 * - `<el ${transition(fade({duration, ...}))}>`
 * - `<el :transition.local=${...}>`: play transition only when element itself is added or removed. `.local` can omit.
 * - `<el :transition.global=${...}>`: play transition when element or any ancestral element is added or removed.
 * 
 * `:transition` binding can dispatch for events on the target element:
 * - `enter-started`: After enter transition started.
 * - `enter-ended`: After enter transition ended.
 * - `leave-started`: After leave transition started.
 * - `leave-ended`: After leave transition ended.
 */
export class TransitionBinding implements Binding, Part {

	private readonly el: Element
	private readonly global: boolean
	private result: TransitionResult | null = null
	private mixedTransitionType: MixedTransitionType | null = null
	private mixedTransition: PerFrameTransition | WebTransition | null = null

	constructor(el: Element, _context: any, modifiers: string[] | undefined) {
		this.el = el
		this.global = modifiers ? modifiers.includes('global') : false
	}

	afterConnectCallback(param: number) {
		if (this.global || param & PartCallbackParameter.DirectlyMoveNodes) {
			this.enter()
		}
	}

	async beforeDisconnectCallback(param: number): Promise<void> {
		if (this.global || param & PartCallbackParameter.DirectlyMoveNodes) {
			return this.leave()
		}
	}

	update(result: TransitionResult | null) {
		this.result = result

		// Cancel transition immediately if transition value becomes `null`.
		if (!this.result) {
			this.clearTransition()
		}
	}

	private clearTransition() {
		this.mixedTransitionType = null

		if (this.mixedTransition) {
			this.mixedTransition.cancel()
			this.mixedTransition = null
		}
	}

	/** Called after the attached element is connected into document. */
	async enter() {
		if (!this.result) {
			return
		}

		let direction = this.result.options
		if (direction === 'leave' || direction === 'none') {
			return
		}

		let props = await this.result.getter(this.el, this.result.options, 'enter')
		if (!props) {
			return
		}
		
		this.updateMixedTransition(props)

		let enterStartedEvent = new CustomEvent('enter-started')
		this.el.dispatchEvent(enterStartedEvent)

		if (this.mixedTransitionType === MixedTransitionType.PerFrame) {
			let perFrame = (props as PerFrameTransitionProperties).perFrame
			await (this.mixedTransition as PerFrameTransition).playBetween(0, 1, perFrame)
		}
		else {
			let startFrame = (props as WebTransitionProperties).startFrame;
			let endFrame = (props as WebTransitionProperties).endFrame;
			await (this.mixedTransition as WebTransition).playBetween(startFrame, endFrame)
		}

		let enterEndedEvent = new CustomEvent('enter-ended')
		this.el.dispatchEvent(enterEndedEvent)
	}

	/** Called before the attached element begin to disconnect from document. */
	async leave() {
		if (!this.result) {
			return
		}

		let direction = this.result.options
		if (direction === 'enter' || direction === 'none') {
			return
		}

		let props = await this.result.getter(this.el, this.result.options, 'leave')
		if (!props) {
			return
		}

		this.updateMixedTransition(props)

		let leaveStartedEvent = new CustomEvent('leave-started')
		this.el.dispatchEvent(leaveStartedEvent)

		if (this.mixedTransitionType === MixedTransitionType.PerFrame) {
			let perFrame = (props as PerFrameTransitionProperties).perFrame;
			(this.mixedTransition as PerFrameTransition).playBetween(1, 0, perFrame);
		}
		else {
			let startFrame = (props as WebTransitionProperties).startFrame;
			let endFrame = (props as WebTransitionProperties).endFrame;
			(this.mixedTransition as WebTransition).playBetween(endFrame, startFrame)
		}

		let leaveEndedEvent = new CustomEvent('leave-ended')
		this.el.dispatchEvent(leaveEndedEvent)
	}

	private updateMixedTransition(props: TransitionProperties) {
		let type = this.getMixedTransitionType(props)

		if (this.mixedTransitionType !== type) {
			if (this.mixedTransition) {
				this.mixedTransition.finish()
			}

			this.mixedTransition = null
			this.mixedTransitionType = type
		}

		if (!this.mixedTransition) {
			if (type === MixedTransitionType.PerFrame) {
				this.mixedTransition = new PerFrameTransition({
					duration: props.duration,
					easing: props.easing,
					delay: props.delay,
				})
			}
			else {
				this.mixedTransition = new WebTransition(this.el, {
					duration: props.duration,
					easing: props.easing as WebTransitionOptions['easing'],
					delay: props.delay,
				})
			}
		}
	}

	private getMixedTransitionType(props: TransitionProperties): MixedTransitionType {
		if ((props as PerFrameTransitionProperties).perFrame) {
			return MixedTransitionType.PerFrame
		}
		else {
			return MixedTransitionType.Web
		}
	}
}

defineNamedBinding('transition', TransitionBinding)