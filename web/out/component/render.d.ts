import { TemplateSlot } from '../template';
import { Component } from './component';
import { RenderResult } from './types';
/** Rendered result, or a function to return it. */
export type RenderResultRenderer = RenderResult | (() => RenderResult);
/**
 * Render a component like with `<slot>` as tag to contain content specified by html`...` bound with `context`,
 * or contain responsive content render by function like `() => html`...`` bound with `context`.
 */
export declare function render(renderer: RenderResultRenderer, context?: any): RenderedComponentLike;
/**
 * Same as an anonymous component, except it attaches to a context,
 * and render all the things within that context.
 */
export declare class RenderedComponentLike<E = any> extends Component<E> {
    /** `context` can be overwritten. */
    context: any;
    /** `renderer` can be overwritten. */
    renderer: RenderResultRenderer;
    /** Component generated from `getAs`. */
    private componentRenderedAs;
    private componentRenderedNeedsValidate;
    constructor(renderer: RenderResultRenderer, context: any, host?: HTMLElement | null);
    /** Replace context of content slot. */
    protected initContentSlot(): TemplateSlot;
    protected render(): RenderResult;
    protected onUpdated(): void;
    /**
     * Get the component bound with first rendered element.
     * E.g., render a popup or contextmenu based on current rendered.
     * Normally you should wait for render complete then get, or you will receive `null`.
     */
    getAs<T extends typeof Component = typeof Component>(cons: T): InstanceType<T> | null;
}
