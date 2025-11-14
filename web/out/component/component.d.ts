import { ContextVariableConstructor, EventFirer, Observed, Updatable } from '@pucelle/lupos';
import { ComponentStyle } from './style';
import { TemplateSlot, SlotContentType } from '../template';
import { RenderResult } from './types';
import { Part, PartCallbackParameterMask } from '../part';
import { SlotRange } from '../template/slot-range';
export interface ComponentEvents {
    /**
     * After component's element was inserted into document,
     * and component itself has been assigned properties.
     * Component hasn't updated, but have been enqueued to update.
     * Will be dispatched every time the component's element entered into document.
     *
     * You may assign some more properties or register events here.
     */
    'connected': () => void;
    /**
     * After component's element will soon be removed from document.
     * Will be dispatched every time the component's element will be removed from document.
     *
     * You may cache some dom properties or release events here.
     */
    'will-disconnect': () => void;
    /**
     * After every time the component get updated.
     * All the data, child nodes, child components are ready.
     * But child components were not updated.
     *
     * Child components has been referenced, and have accepted data assignments,
     * You may continue to change properties what will be assigned to child components,
     * like reading element size, and assign to child components.
     */
    'updated': () => void;
}
/** Components state. */
declare const enum ComponentStateMask {
    Created = 1,
    ReadyAlready = 2,
    Connected = 4,
    WillCallConnectCallback = 8
}
/**
 * Super class of all the components.
 * @typeparam `E`: Event interface in `{eventName: (...args) => void}` format.
 *
 * Connect Lifecycle:
 *  - Parent `afterConnectCallback`, from element appending to dom, parent connecting, or custom element initializing
 *  - Parent `onCreated` for only once
 *  - Parent `onConnected`
 *  	- Parent watchers, effectors, computers get enqueued
 *  - Parent fires `connected` event
 *  - Parent to be enqueued
 * 	- ----Queue callback
 * 		- See Update Lifecycle below
 *  	- Parent `onReady` for only once
 *
 * Update Lifecycle:
 *  - Parent watchers, effectors, computers get updated in their declaration order.
 *  - Parent `update` from newly render result, apply data to each child part
 *  	- Enqueue Child1 watchers, effectors, computers
 * 		- Enqueue Child1 to update.
 * 		- Enqueue Child2 watchers, effectors, computers
 * 		- Enqueue Child2 to update.
 *  - Parent `onUpdated`
 *  - Parent fires `updated` event
 *  - ----Queue callback
 *  	- Child1 and Child2 watchers, effectors, computers of Child1 and Child2
 *  	- Child1 update like Parent
 *  	- Child2 update like Parent
 *
 * Disconnect Lifecycle:
 *  - Parent `beforeDisconnectCallback`, from element removing from dom, or parent disconnecting.
 *  - Parent `onWillDisconnect`
 * 		- Parent watchers, effectors, computers get disconnected
 *  - Parent fires `will-disconnect`
 *  - Parent disconnect each child part
 * 		- Each child's disconnect lifecycle works just like parent
 */
export declare class Component<E = any> extends EventFirer<E & ComponentEvents> implements Part, Updatable, Observed {
    /**
     * After a source component connected,
     * set context variables declared by `@setContext`.
     * Implemented from `ContextVariableConstructor`.
     */
    static setContextVariable: ContextVariableConstructor['setContextVariable'];
    /**
     * Get source component where declares `@setContext prop`,
     * from it's descendant component which declares `@useContext prop`.
     * Implemented from `ContextVariableConstructor`.
     */
    static getContextVariableDeclared: ContextVariableConstructor['getContextVariableDeclared'];
    /**
     * After component disconnected,
     * delete it's context variables.
     * Implemented from `ContextVariableConstructor`.
     */
    static deleteContextVariables: ContextVariableConstructor['deleteContextVariables'];
    /**
     * Get component instance from an element.
     * Returned result will be auto-inferred as instance of current constructor, so please ensure they are.
     * @param element: The element to get component instance at.
     */
    static from<C extends {
        new (...args: any): any;
    }>(this: C, element: Element): InstanceType<C> | null;
    /**
     * Get closest ancestor element (or self) which is the instance of specified component constructor.
     * @param element: The element from which to check component instance.
     * @param searchDepth: Max search depth, default value is `30`.
     */
    static fromClosest<C extends {
        new (...args: any): any;
    }>(this: C, element: Element, searchDepth?: number): InstanceType<C> | null;
    /**
     * Provides a global css content, used as styles for current component.
     * Although it supports dynamic css content, we would suggest using only static css content.
     */
    static style: ComponentStyle | null;
    /** Compiler will add this property after analysis render result. */
    static SlotContentType: SlotContentType | null;
    /** The root element of component. */
    readonly el: HTMLElement;
    /**
     * Help to identify the creation orders of component,
     * or for debugging a specified component.
     * Only for internal usages.
     */
    readonly iid: number;
    /** State of current component, byte mask type. */
    protected $stateMask: ComponentStateMask | 0;
    /** Help to patch render result to current element. */
    protected $contentSlot: TemplateSlot<any>;
    /**
     * Cache range of rest slot content,
     * which will be used to fill `<slot />` element the component itself render.
     */
    protected $restSlotRange: SlotRange | null;
    /**
     * Caches slot elements which are marked as `<... slot="slotName">`.
     * You should re-define the detailed type like `{name1: Element, ...}` in derived components.
     */
    protected slotElements: Record<string, Element | null>;
    constructor(el?: HTMLElement);
    /**
     * Whether current component was connected into document.
     * Readonly outside of component.
     */
    get connected(): boolean;
    /** After any tracked data change, enqueue it to update in next animation frame. */
    willUpdate(): void;
    /**
     * Doing update immediately.
     * Can be an async function, and can call `untilChildUpdateComplete`
     * inside to wait for child components update completed.
     */
    update(this: Component<{}>): void | Promise<void>;
    /** Update and track rendering contents. */
    protected updateRendering(): void;
    /**
     * Defines the results the current component should render.
     * Child class should overwrite this method, normally returns html`...` or a string.
     * You can choose to not overwrite `render()` to keep it returns `null`,
     * when you don't want to render any child nodes.
     */
    protected render(): RenderResult;
    /** Init `contentSlot`. */
    protected initContentSlot(): TemplateSlot;
    /**
     * Called when component was connected and all properties were assigned.
     * All the child nodes are not prepared yet, until `onReady`.
     *
     * You may change properties, visit `el` or parent nodes,
     * or register some component events here.
     *
     * Fired for only once.
     */
    protected onCreated(): void;
    /**
     * After every time the component get updated.
     * All the data, child nodes, child components are ready.
     * But child components were not updated.
     *
     * Child components has been referenced, and have accepted data assignments,
     * You may continue to change properties what will be assigned to child components,
     * like reading element size, and assign to child components.
     */
    protected onUpdated(): void;
    /**
     * Called when component is updated for the first time.
     * All the data, nodes of current component are ready.
     * But child components were not updated.
     *
     * You can visit all child nodes, and can access and assign
     * properties to child components by their references.
     *
     * This fires for only once.
     */
    protected onReady(): void;
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
    protected onConnected(): void;
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
    protected onWillDisconnect(): void;
    /**
     * Calls callback after the component get updated for the next time.
     * Note you need to ensure current component has been enqueued, or will be enqueued soon.
     * Note if immediately disconnected, `callback` may never be called.
     */
    whenUpdated(this: Component<{}>, callback: () => void): void;
    /** Returns a promise which will be resolved after the component is next time connected. */
    whenConnected(this: Component<{}>, callback: () => void): void;
    /** Returns a promise which will be resolved after the component is next time will disconnect. */
    whenWillDisconnect(this: Component<{}>, callback: () => void): void;
    /**
     * Returns a promise which will be resolved after the component is next time updated.
     * Note you need to ensure current component has been enqueued, or will be enqueued soon.
     * Note if immediately disconnected, this may never be resolved.
     *
     * If want to interpolate data before child component updated,
     * we would suggest using `whenUpdate(...)`.
     */
    untilUpdated(this: Component<{}>): Promise<void>;
    /** Returns a promise which will be resolved after the component is next time connected. */
    untilConnected(this: Component<{}>): Promise<void>;
    /** Returns a promise which will be resolved after the component is next time will disconnect. */
    untilWillDisconnect(this: Component<{}>): Promise<void>;
    /**
     * Calls callback after all children, and all descendant components update completed.
     *
     * Use it when you need to wait for child and descendant components
     * update completed and do some measurement.
     *
     * Note you need to ensure current component has been enqueued or is updating,
     * or will be enqueued soon.
     *
     * ```ts
     * update() {
     *     this.updateRendering()
     *     this.whenChildComplete(this.doMoreAfterChildUpdateCompleted)
     *     ...
     * }
     * ```
     *
     * or
     *
     * ```ts
     * com.willUpdate()
     * com.whenChildComplete(doMoreAfterChildUpdateCompleted)
     * ```
     */
    whenChildComplete(this: Component, callback: () => void): void;
    /**
     * Returns a promise, which will be resolved after all children,
     * and all descendants update completed.
     *
     * Use it when you need to wait for child and descendant components
     * update completed and do some measurement.
     *
     * ```ts
     * async update() {
     *     this.updateRendering()
     *     await UpdateQueue.untilChildComplete()
     *     await barrierDOMReading()
     *     ...
     * }
     * ```
     *
     * or
     *
     * ```ts
     * com.willUpdate()
     * await com.untilChildComplete()
     * ...
     * ```
     */
    untilChildComplete(): Promise<void>;
    /**
     * When a dynamic component is replaced by another,
     * transfer all the slot contents to it.
     * For internal usage only.
     */
    $transferSlotContents(toCom: Component): void;
    /**
     * For `:slot=slotName` binding to apply slot elements,
     * which may be used later to fill `<slot name=slotName>` inside current component context.
     * For internal usage only.
     */
    $setSlotElement(slotName: string, el: Element | null): void;
    /**
     * Get element by specified slot name,
     * and use it to fill `<slot name=slotName>` inside current component context.
     * For internal usage only, and be called by compiled codes.
     */
    $getSlotElement(slotName: string): Element | null;
    /**
     * Apply rest slot range from a dynamic component,
     * which may be used to fill `<slot>` inside current component context.
     * For internal usage only, and will be called by compiled codes.
     */
    $applyRestSlotRange(slotRange: SlotRange): void;
    /**
     * Apply rest slot range nodes, which may be used to fill `<slot>` inside current component context.
     * For internal usage only, and will be called by compiled codes.
     */
    $applyRestSlotRangeNodes(startInnerNode: ChildNode, endInnerNode?: ChildNode): void;
    /**
     * Get list of rest slot nodes.
     * Use these nodes to fill `<slot />` element that the component itself render.
     * For internal usage only, and be called by compiled codes.
     */
    $getRestSlotNodes(): ChildNode[];
    afterConnectCallback(this: Component<{}>, param: PartCallbackParameterMask | 0): void;
    beforeDisconnectCallback(this: Component<{}>, param: PartCallbackParameterMask | 0): Promise<void> | void;
    /** Whether has some real content rendered. */
    hasContentRendered(): boolean;
    /** Append current element into a container, and do connect.
     * If `canPlayEnterTransition` is specified as `true`, which is also default action,
     * will play enter transition after appended.
     */
    appendTo(container: Element, canPlayEnterTransition?: boolean): void;
    /**
     * Insert current element before an element, and do connect.
     * If `canPlayEnterTransition` is specified as `true`, which is also default action,
     * will play enter transition after inserted.
     */
    insertBefore(sibling: Element, canPlayEnterTransition?: boolean): void;
    /**
     * Insert current element after an element, and do connect.
     * If `canPlayEnterTransition` is specified as `true`, which is also default action,
     * will play enter transition after inserted.
     */
    insertAfter(sibling: Element, canPlayEnterTransition?: boolean): void;
    /**
     * Remove or will remove element from document.
     * By default it disconnect immediately and will not play any leave transition,
     * except `canPlayLeaveTransition` specified as `true`.
     *
     * `remove` process with transitions may failed if immediately appended again,
     * in this scenario leave transitions will be stopped,
     * can visit `connected` to know whether remove successfully.
     */
    remove(canPlayLeaveTransition?: boolean): Promise<void> | void;
    /**
     * Connect current component manually even it's not in document,
     * and also wait for component get updated.
     * Skip and return `true` if already connected.
     * Returns false if get disconnected before updated.
     */
    connectManually(this: Component): Promise<boolean>;
}
export {};
