import {ObjectUtils, PerFrameTransition, WebTransition, WebTransitionOptions} from '@pucelle/ff'
import {Binding} from './types'
import {PerFrameTransitionProperties, TransitionProperties, TransitionResult, WebTransitionProperties} from './transitions'
import {Part, PartCallbackParameterMask} from '../types'


/** Transition type, enum of two. */
enum MixedTransitionType {
	PerFrame,
	Web,
}


/** Cache those bindings that haven't trigger connect callback yet. */
const NotConnectCallbackForFirstTime: WeakSet<TransitionBinding> = new WeakSet()


/**
 * `:transition` binding can play transition after element connected or before element disconnect.
 * - `<el :transition=${fade({duration, ...})}>`
 * - `<el :transition.local=${...}>`: play transition only when element itself get inserted or removed. `.local` can omit.
 * - `<el :transition.global=${...}>`: play transition when element or any ancestral element get inserted or removed.
 * - `<el :transition.immediate=${...}>`: play transition immediately when element initialized.
 * 
 * `:transition` binding will dispatch 4 events on the target element:
 * - `transition-enter-started`: After enter transition started.
 * - `transition-enter-ended`: After enter transition ended.
 * - `transition-leave-started`: After leave transition started.
 * - `transition-leave-ended`: After leave transition ended.
 */
export class TransitionBinding implements Binding, Part {

	private readonly el: Element

	/** 
	 * A `local` transition as default action,
	 * can only play when attached elements been directly inserted or removed.
	 * A `global` transition can play when any level of ancestral element get inserted or removed.
	 */
	private global: boolean = false

	/** 
	 * By default, transition cant play when get initialized.
	 * But set `immediate` can make it play.
	 */
	private immediate: boolean = false

	private result: TransitionResult | null = null
	private mixedTransitionType: MixedTransitionType | null = null
	private mixedTransition: PerFrameTransition | WebTransition | null = null

	constructor(el: Element, _context: any, modifiers: ('global' | 'local' | 'immediate')[]) {
		this.el = el
		this.global = modifiers.includes('global')
		this.immediate = modifiers.includes('immediate')

		NotConnectCallbackForFirstTime.add(this)
	}

	afterConnectCallback(param: PartCallbackParameterMask) {
		if (NotConnectCallbackForFirstTime.has(this)) {
			NotConnectCallbackForFirstTime.delete(this)

			// Prevent first time enter transition playing if not `immediate`.
			if (!this.immediate) {
				return
			}
		}

		if (this.global || param & PartCallbackParameterMask.DirectNodeToMove) {
			this.enter()
		}
	}

	beforeDisconnectCallback(param: PartCallbackParameterMask): Promise<void> | void {

		// Ancestral element has been removed immediately, no need to play transition.
		if (param & PartCallbackParameterMask.RemoveImmediately) {
			return
		}

		if (this.global || param & PartCallbackParameterMask.DirectNodeToMove) {
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

		let enterStartedEvent = new CustomEvent('transition-enter-started')
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

		let enterEndedEvent = new CustomEvent('transition-enter-ended')
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

		let leaveStartedEvent = new CustomEvent('transition-leave-started')
		this.el.dispatchEvent(leaveStartedEvent)

		if (this.mixedTransitionType === MixedTransitionType.PerFrame) {
			let perFrame = (props as PerFrameTransitionProperties).perFrame;
			await (this.mixedTransition as PerFrameTransition).playBetween(1, 0, perFrame);
		}
		else {
			let startFrame = (props as WebTransitionProperties).startFrame;
			let endFrame = (props as WebTransitionProperties).endFrame;
			await (this.mixedTransition as WebTransition).playBetween(endFrame, startFrame)
		}

		let leaveEndedEvent = new CustomEvent('transition-leave-ended')
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
			let options = ObjectUtils.cleanEmptyValues({
				duration: props.duration,
				easing: props.easing,
				delay: props.delay,
			})

			if (type === MixedTransitionType.PerFrame) {
				this.mixedTransition = new PerFrameTransition(options)
			}
			else {
				this.mixedTransition = new WebTransition(this.el, options as WebTransitionOptions)
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
