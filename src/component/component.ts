import {ContextVariableConstructor, EventFirer, Observed, enqueueUpdate, beginTrack, endTrack, trackGet, trackSet, promiseWithResolves} from '@pucelle/ff'
import {ensureComponentStyle, ComponentStyle} from './style'
import {addElementComponentMap, getComponentFromElement} from './from-element'
import {TemplateSlot, SlotPosition, SlotPositionType, CompiledTemplateResult, SlotContentType} from '../template'
import {ComponentConstructor, RenderResult} from './types'
import {getComponentSlotParameter, holdConnectCallbackParameter, Part, PartCallbackParameterMask} from '../part'
import {SlotRange} from '../template/slot-range'
import {deleteContextVariables, getContextVariableDeclared, setContextVariable} from './context-variable'


export interface ComponentEvents {

	/** 
	 * After component's element was inserted into document,
	 * and component itself has been assigned properties.
	 * Component hasn't updated, but have been enqueued to update.
	 * Will be dispatched every time the component's element entered into document.
	 * 
	 * You may assign some more properties or register events here.
	 */
	'connected': () => void

	/** 
	 * After component's element will soon be removed from document.
	 * Will be dispatched every time the component's element will be removed from document.
	 * 
	 * You may cache some dom properties or release events here.
	 */
	'will-disconnect': () => void

	/** 
	 * After every time the component get updated.
	 * Right now all data has been assigned, content parts have been updated.
	 * but descendant components haven't dispatched updated event.
	 */
	'updated': () => void
}


/** Current of `component.incrementalId`. */
let IncrementId = 1


/** Components state. */
enum ComponentStateMask {
	Created = 2 ** 0,
	ReadyAlready = 2 ** 1,
	Connected = 2 ** 2,
}


/** 
 * Super class of all the components.
 * @typeparam `E`: Event interface in `{eventName: (...args) => void}` format.
 * 
 * Note about:
 * - If instantiate from being part of a template, It **can** be connected or disconnected after it's parent component insert or delete it.
 * - If instantiate from `new`, It **cant** be automatically connected or disconnected along it's element.
 * - If instantiate from custom element, It **can** be automatically connected or disconnected along it's element.
 */
export class Component<E = any> extends EventFirer<E & ComponentEvents> implements Part, Observed {

	/** 
	 * After a source component connected,
	 * set context variables declared by `@setContext`.
	 * Implemented from `ContextVariableConstructor`.
	 */
	static setContextVariable: ContextVariableConstructor['setContextVariable'] = setContextVariable

	/**
	 * Get source component where declares `@setContext prop`,
	 * from it's descendant component which declares `@useContext prop`.
	 * Implemented from `ContextVariableConstructor`.
	 */
	static getContextVariableDeclared: ContextVariableConstructor['getContextVariableDeclared'] = getContextVariableDeclared

	/** 
	 * After component disconnected,
	 * delete it's context variables.
	 * Implemented from `ContextVariableConstructor`.
	 */
	static deleteContextVariables: ContextVariableConstructor['deleteContextVariables'] = deleteContextVariables

	/** 
	 * Get component instance from an element.
	 * Returned result will be auto-inferred as instance of current constructor, so please ensure they are.
	 * @param element: The element to get component instance at.
	 */
	static from<C extends {new (...args: any): any}>(this: C, element: Element): InstanceType<C> | null {
		return getComponentFromElement(element) as any
	}

	/** 
	 * Get closest ancestor element (or self) which is the instance of specified component constructor.
	 * @param element: The element from which to check component instance.
	 * @param searchDepth: Max search depth, default value is `30`.
	 */
	static fromClosest<C extends {new (...args: any): any}>(this: C, element: Element, searchDepth: number = 30): InstanceType<C> | null {
		let el: Element | null = element
		let depth = 0

		while (el) {
			let com = Component.from(el)
			if (com instanceof this) {
				return com as InstanceType<C>
			}
	
			el = el.parentElement

			if (depth >= searchDepth) {
				break
			}

			depth++
		}

		return null
	}

	/**
	 * Provides a global css content, used as styles for current component.
	 * You can nest css codes just like in SCSS, and use `$` to reference parent selector.
	 */
	static style: ComponentStyle | null = null

	/** 
	 * Call after component class declaration,
	 * to ensure it's relied styles appended into document.
	 * 
	 * Why not call it automatically?
	 * Before a style appended, it should ensure all super style,
	 * and all referenced style appended, so can overwrite them.
	 */
	static ensureStyle() {
		ensureComponentStyle(this)
	}

	/** Compiler will add this property after analysis render result. */
	static SlotContentType: SlotContentType | null = null


	/** 
	 * Help to identify the creation orders of component.
	 * Only for internal usages.
	 */
	protected readonly incrementId: number = IncrementId++

	/** The root element of component. */
	readonly el: HTMLElement

	/** State of current component, byte mask type. */
	protected state: ComponentStateMask | 0 = 0

	/** Help to patch render result to current element. */
	protected contentSlot!: TemplateSlot<any>

	/**
	 * Caches slot elements which are marked as `<... slot="slotName">`.
	 * You should re-define the detailed type like `{name1: Element, ...}` in derived components.
	 */
	protected slotElements: Record<string, Element | null> = {}

	/** 
	 * Cache range of rest slot content,
	 * which will be used to fill `<slot />` element the component itself render.
	 */
	protected restSlotRange: SlotRange | null = null

	/** 
	 * Whether needs update.
	 * Only when `needsUpdate` is `true`, current component can be updated.
	 */
	needsUpdate: boolean = true

	constructor(el: HTMLElement = document.createElement('div')) {
		super()
		this.el = el
		addElementComponentMap(el, this)
	}

	/** 
	 * Whether current component was connected into document.
	 * Readonly outside of component.
	 */
	get connected(): boolean {
		return (this.state & ComponentStateMask.Connected) > 0
	}

	/** Init `contentSlot`. */
	protected initContentSlot(): TemplateSlot {
		let position = new SlotPosition<SlotPositionType.AfterContent>(SlotPositionType.AfterContent, this.el)
		let Com = this.constructor as ComponentConstructor

		return new TemplateSlot(position, this, Com.SlotContentType!)
	}

	/**
	 * Called when component was connected and all properties were assigned.
	 * All the child nodes are not prepared yet, until `onReady`.
	 * You may change some data or visit parent nodes, or register some events for self here.
	 * Fired for only once.
	 */
	protected onCreated() {
		this.contentSlot = this.initContentSlot()
	}

	/**
	 * Called when component is ready for the first time.
	 * All the data, child nodes, child components were prepared.
	 * You may visit or further-adjust child nodes here, or register events for them.
	 * Fired for only once.
	 */
	protected onReady() {}

	/** 
	 * Called after every time all the data and child nodes, child components were updated.
	 * Same with `onReady` when the first time call.
	 * but normally you would don't need to.
	 */
	protected onUpdated() {}

	/** 
	 * After component's element was inserted into document,
	 * and component itself haven't been updated, but have been enqueued to update.
	 * Will be dispatched every time the component's element entered into document.
	 * 
	 * You may assign some properties or register events here.
	 * 
	 * If you need to register global listeners like `resize` when element exist in document,
	 * or watch non-self properties, you should register them here.
	 * 
	 * If choose to overwrite `onConnected`, Never forget to call `super.onConnected()`.
	 */
	protected onConnected() {}

	/** 
	 * After component's element will soon be removed from document.
	 * Will be dispatched every time the component's element will be removed from document.
	 * 
	 * You may cache some dom properties or release events here.
	 * 
	 * If you need to register global listeners like `resize` when element exist in document,
	 * or watch non-self properties, you should unregister them here.
	 * 
	 * If choose to overwrite `onWillDisconnect`, Never forget to call `super.onWillDisconnect()`.
	 */
	protected onWillDisconnect() {}

	/** 
	 * Returns a promise which will be resolved after the component is ready,
	 * `ready` means first time updated.
	 * If is ready already, resolve the promise immediately.
	 */
	protected untilReady(this: Component<{}>): Promise<void> {
		let {promise, resolve} = promiseWithResolves()

		if ((this.state & ComponentStateMask.ReadyAlready) === 0) {
			this.once('updated', resolve)
		}
		else {
			resolve()
		}

		return promise
	}

	/** 
	 * When a dynamic component is replaced by another,
	 * transfer all the slot contents to it.
	 */
	__transferSlotContents(toCom: Component) {
		toCom.slotElements = this.slotElements
		toCom.restSlotRange = this.restSlotRange
	}

	/** 
	 * For `:slot=slotName` binding to apply slot elements,
	 * which may be used later to fill `<slot name=slotName>` inside current component context.
	 * For inner usage only.
	 */
	__setSlotElement(slotName: string, el: Element | null) {
		this.slotElements[slotName] = el
		trackSet(this.slotElements, slotName)
	}

	/** 
	 * Get element by specified slot name,
	 * and use it to fill `<slot name=slotName>` inside current component context.
	 * For inner usage only, and be called by compiled codes.
	 */
	__getSlotElement(slotName: string): Element | null {
		trackGet(this.slotElements, slotName)
		return this.slotElements[slotName]
	}

	/** 
	 * Apply rest slot range, which may be used to fill `<slot>` inside current component context.
	 * For inner usage only, and will be called by compiled codes.
	 */
	__applyRestSlotRange(slotRange: SlotRange) {
		this.restSlotRange = slotRange
	}

	/** 
	 * Apply rest slot range nodes, which may be used to fill `<slot>` inside current component context.
	 * For inner usage only, and will be called by compiled codes.
	 */
	__applyRestSlotRangeNodes(startInnerNode: ChildNode, endInnerNode: ChildNode = startInnerNode) {
		this.restSlotRange = new SlotRange(startInnerNode, endInnerNode)
	}

	/** 
	 * Get list of rest slot nodes.
	 * Use these nodes to fill `<slot />` element that the component itself render.
	 * For inner usage only, and be called by compiled codes.
	 */
	__getRestSlotNodes(): ChildNode[] {
		return this.restSlotRange ? [...this.restSlotRange.walkNodes()] : []
	}

	afterConnectCallback(this: Component<{}>, param: PartCallbackParameterMask | 0) {
		if (this.connected) {
			return
		}

		if ((this.state & ComponentStateMask.Created) === 0) {
			this.state |= ComponentStateMask.Created
			this.onCreated()
		}

		this.state |= ComponentStateMask.Connected
		this.onConnected()
		this.fire('connected')

		// Avoid child parts calls `afterConnectCallback`.
		let slotParam = getComponentSlotParameter(param)
		holdConnectCallbackParameter(this.contentSlot, slotParam)

		// onConnected may assign properties and cause enqueue current component,
		// so here should ensure enqueuing update later than it.
		this.update()

		// Call connect callback if not yet.
		this.contentSlot.afterConnectCallback(slotParam)

		// Call ready if not yet.
		if ((this.state & ComponentStateMask.ReadyAlready) === 0) {
			this.state |= ComponentStateMask.ReadyAlready
			this.onReady()
		}
	}

	beforeDisconnectCallback(this: Component<{}>, param: PartCallbackParameterMask | 0): Promise<void> | void {
		if (!this.connected) {
			return
		}

		this.state &= ~ComponentStateMask.Connected
		this.onWillDisconnect()
		this.fire('will-disconnect')

		// If haven't called connect callback, not call disconnect callback also.
		return this.contentSlot.beforeDisconnectCallback(getComponentSlotParameter(param))
	}

	/** After any tracked data change, enqueue it to update in next animation frame. */
	protected willUpdate() {
		if (this.needsUpdate) {
			return
		}

		// Component create earlier, update earlier.
		enqueueUpdate(this.update, this, this.incrementId)
		this.needsUpdate = true
	}
	
	/** 
	 * Doing update immediately.
	 * Update can only work after connected,
	 * and calls `willUpdate` cause `needsUpdate=true`.
	 * But you can set `needsUpdate = true` explicitly to force it can be updated.
	 */
	update(this: Component<{}>) {
		if (!this.connected || !this.needsUpdate) {
			return
		}

		this.updateRendering()
		this.onUpdated()
		this.fire('updated')
		this.needsUpdate = false
	}

	/** Update and track rendering contents. */
	protected updateRendering() {
		beginTrack(this.willUpdate, this)
		let result: CompiledTemplateResult | CompiledTemplateResult[] | string | null

		try {
			result = this.render() as typeof result
		}
		catch (err) {
			result = null
			console.warn(err)
		}

		this.contentSlot.update(result)

		// `endTrack` here is important.
		// This will cause tracking `ForBlock` update.
		endTrack()
	}

	/** 
	 * Defines the results the current component should render.
	 * Child class should overwrite this method, normally returns html`...` or a string.
	 * You can choose to not overwrite `render()` to keep it returns `null`,
	 * when you don't want to render any child nodes.
	 */
	protected render(): RenderResult {
		return null
	}
	
	/** Append current element into a container, and do connect. */
	appendTo(container: Element) {
		if (this.connected) {
			this.remove()
		}
		
		container.append(this.el)
		
		if (document.contains(this.el)) {
			this.afterConnectCallback(PartCallbackParameterMask.DirectNodeToMove)
		}
	}

	/** Insert current element before an element, and do connect. */
	insertBefore(sibling: Element) {
		if (this.connected) {
			this.remove()
		}

		sibling.before(this.el)

		if (document.contains(this.el)) {
			this.afterConnectCallback(PartCallbackParameterMask.DirectNodeToMove)
		}
	}

	/** Insert current element after an element, and do connect. */
	insertAfter(sibling: Element) {
		if (this.connected) {
			this.remove()
		}

		sibling.after(this.el)

		if (document.contains(this.el)) {
			this.afterConnectCallback(PartCallbackParameterMask.DirectNodeToMove)
		}
	}

	/** 
	 * Remove or will remove element from document.
	 * by default it disconnect immediately and will not play any leave transition,
	 * except `canPlayLeaveTransition` specified as `true`.
	 */
	remove(canPlayLeaveTransition: boolean = false): Promise<void> | void {
		if (!this.connected) {
			return
		}

		let mask: PartCallbackParameterMask = PartCallbackParameterMask.DirectNodeToMove

		if (!canPlayLeaveTransition) {
			mask |= PartCallbackParameterMask.MoveImmediately
		}

		let result = this.beforeDisconnectCallback(mask)

		// Wait for disconnect promise, then remove node.
		if (canPlayLeaveTransition && result) {
			return result.then(() => {
				this.el.remove()
			})
		}
		
		this.el.remove()
	}

	/** 
	 * Connect current component manually even it's not truly connected.
	 * Will cause update immediately.
	 */
	connectManually() {
		let param: PartCallbackParameterMask = PartCallbackParameterMask.DirectNodeToMove
			| PartCallbackParameterMask.MoveImmediately

		this.afterConnectCallback(param)
	}
}


// For localhost debugging.
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
	let original = (Component as any).prototype.onCreated;
	
	(Component as any).prototype.onCreated = function() {
		original.call(this)
		this.el.setAttribute('com', this.constructor.name)
		this.el.setAttribute('iid', this.incrementId)
	}
}