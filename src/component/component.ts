import {DependencyTracker, EventFirer, UpdateQueue, observable} from '@pucelle/ff'
import {ensureComponentStyle, ComponentStyle} from './style'
import {getComponentFromElement} from './from-element'
import {TemplateSlot, TemplateSlotPosition, SlotPositionType, CompiledTemplateResult} from '../template'
import {ComponentConstructor, RenderResult} from './types'
import {Part, PartCallbackParameter} from '../types'


export interface ComponentEvents {

	/** 
	 * After component's element was inserted into document.
	 * Will be dispatched after every time the component's element entered into document.
	 */
	connected: () => void

	/** 
	 * After component's element was removed from document.
	 * Will be dispatched after every time the component's element was removed from document.
	 */
	disconnected: () => void

	/** 
	 * After every time the component's all the data and child nodes updated.
	 * All the child components have dispatched `updated` event now.
	 */
	updated: () => void
}


/** Current of `component.incrementalId`. */
let IncrementalId = 1

/** 
 * Record components that is not ready.
 * - 1: Wait for Created
 * - 2: Wait for Ready
 */
const ComponentCreatedReadyStates: WeakMap<object, 1 | 2> = new WeakMap()


/** 
 * Super class of all the components.
 * - `E`: Event interface in `{eventName: (...args) => void}` format.
 * 
 * Note about:
 * - If instantiate from being part of a template, It **can** be connected or disconnected after it's parent component insert or delete it.
 * - If instantiate from `new`, It **cant** be automatically connected or disconnected along it's element.
 * - If instantiate from custom element, It **can** be automatically connected or disconnected along it's element.
 */
@observable
export class Component<E = any> extends EventFirer<E & ComponentEvents> implements Part {

	/** 
	 * Get component instance from an element.
	 * Returned result will be auto-infered as instance of current constructor, so please ensure they are.
	 * - `el`: The element to get component instance at.
	 */
	static from<C extends {new (...args: any): any}>(this: C, el: Element): InstanceType<C> | null {
		return getComponentFromElement(el) as any
	}

	/** 
	 * Get closest ancestor element (or self) which is the instance of specified component constructor.
	 * - `el`: The element from which to check component instance.
	 */
	static fromClosest<C extends {new (...args: any): any}>(this: C, element: Element): InstanceType<C> | null {
		let el: Element | null = element

		while (el) {
			if (el instanceof this) {
				return el as InstanceType<C>
			}
			
			el = (el as Element).parentElement
		}

		return null
	}

	/**
	 * Provides a global css content, used as styles for current component.
	 * You can nest css codes just like in SCSS, and use `$` to reference parent selector.
	 */
	static style: ComponentStyle | null = null

	
	/** 
	 * Help to identify the create orders of component.
	 * Only for internal usages.
	 */
	protected readonly incrementalId: number = IncrementalId++

	/** The root element of component. */
	readonly el: HTMLElement

	/** Whether current component was connected into a document. */
	connected: boolean = false

	/** Help to patch render result. */
	protected readonly rootContentSlot: TemplateSlot

	/**
	 * Caches slot elements which are marked as `<... slot="slotName">`.
	 * You should re-define the detailed type like `{name1: Element, ...}` in derived components.
	 */
	protected readonly slotElements: Record<string, Element | null> = {}

	constructor(properties: Record<string, any> = {}, el: HTMLElement = document.createElement('div')) {
		super()

		this.el = el
		this.rootContentSlot = new TemplateSlot(new TemplateSlotPosition(SlotPositionType.AfterContent, this.el), this)
		Object.assign(this, properties)

		ensureComponentStyle(this.constructor as ComponentConstructor)
		ComponentCreatedReadyStates.set(this, 1)
	}

	/**
	 * Called when component was connected and all properties were assigned.
	 * All the child nodes are not prepared yet, until `onReady`.
	 * You may change some data or visit parent nodes, or register some events for self here.
	 * Fired for only once.
	 */
	protected onCreated() {}

	/**
	 * Called when component is ready for the first time
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
	 * Called after component's element was inserted into document.
	 * This will be called each time you inserting the element into document.
	 * 
	 * If you need to register global listeners like `resize` when element exist in document,
	 * or watch non-self properties, you should register them here.
	 * 
	 * If choose to overwrite `onConnected`, Never forget to call `super.onConnected()`.
	 */
	protected onConnected() {
		// After compiled by `@pucelle/lupos.compiler`:
		// - Will track all the `@computed` values here.
		// - Will start `@watch` properties here.
	}

	/**
	 * Called after component's element was removed from document.
	 * This will be called for each time you removing the element from document.
	 * 
	 * If you need to register global listeners like `resize` when element exist in document,
	 * or watch non-self properties, you should unregister them here.
	 * 
	 * If choose to overwrite `onDisconnected`, Never forget to call `super.onDisconnected()`.
	 */
	protected onDisconnected() {
		// After compiled by `@pucelle/lupos.compiler`:
		// - Will clear and untrack all the `@computed` values here.
		// - Will stop `@watch` properties here.
	}

	/** 
	 * Returns a promise which will be resolved after the component is ready,
	 * If is ready already, resolve the promise immediately.
	 */
	protected untilReady(this: Component): Promise<void> {
		if (ComponentCreatedReadyStates.has(this)) {
			return new Promise(resolve => {
				this.once('updated', resolve)
			}) as Promise<void>
		}
		else {
			return Promise.resolve()
		}
	}

	/** 
	 * For `:slot=slotName` binding apply slot elements.
	 * For inner usage only.
	 */
	__applySlotElement(slotName: string, el: Element | null) {
		this.slotElements[slotName] = el
	}

	afterConnectCallback(this: Component, _param: number) {
		if (ComponentCreatedReadyStates.get(this) === 1) {
			ComponentCreatedReadyStates.set(this, 2)
			this.onCreated()
		}

		this.connected = true
		this.willUpdate()
		this.onConnected()
		this.fire('connected')

		this.rootContentSlot.afterConnectCallback(0)
	}

	async beforeDisconnectCallback(this: Component, param: number): Promise<void> {
		DependencyTracker.untrack(this.willUpdate, this)

		this.connected = false
		this.onDisconnected()
		this.fire('disconnected')

		// Only transfer `RemoveImmediately` parameter.
		return this.rootContentSlot.beforeDisconnectCallback(param & PartCallbackParameter.RemoveImmediately)
	}

	/** After any tracked data change, enqueue it to update in next animation frame. */
	protected willUpdate() {
		
		// Create earlier, update earlier.
		UpdateQueue.enqueue(this.update, this, this.incrementalId)
	}
	
	/** Doing update immediately. */
	update(this: Component) {
		if (!this.connected) {
			return
		}

		// May provide an `onBeforeUpdate` here.
		
		this.updateRendering()
		this.onUpdated()
		this.fire('updated')

		if (ComponentCreatedReadyStates.get(this) === 1) {
			ComponentCreatedReadyStates.delete(this)
			this.onReady()
		}
	}

	/** Tracke and update rendering contents. */
	protected updateRendering() {
		DependencyTracker.beginTrack(this.willUpdate, this)
		let result: CompiledTemplateResult | CompiledTemplateResult[] | string | null

		try {
			result = this.render() as typeof result
		}
		catch (err) {
			result = null
			console.warn(err)
		}
		finally {
			DependencyTracker.endTrack()
		}

		this.rootContentSlot!.update(result)
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
	
	/** Append current element into a container, and connect. */
	appendTo(container: Element) {
		container.append(this.el)
		
		if (this.el.ownerDocument) {
			this.afterConnectCallback(0)
		}
	}

	/** Insert current element before an element, and connect. */
	insertBefore(sibling: Element) {
		sibling.before(this.el)

		if (this.el.ownerDocument) {
			this.afterConnectCallback(0)
		}
	}

	/** Insert current element after an element, and connect. */
	insertAfter(sibling: Element) {
		sibling.after(this.el)

		if (this.el.ownerDocument) {
			this.afterConnectCallback(0)
		}
	}

	/** Remove element from document, and disconnect. */
	remove() {
		// Not wait for leave transition.
		this.beforeDisconnectCallback(PartCallbackParameter.RemoveImmediately)
		
		this.el.remove()
	}
}


// For localhost debugging.
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
	(Component as any).prototype.onCreated = function() {
		this.el.setAttribute('com', this.constructor.name)
	}
}