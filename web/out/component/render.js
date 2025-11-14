import { trackGet } from '@pucelle/lupos';
import { TemplateSlot, SlotPosition } from "../template/index.js";
import { Component } from "./component.js";
/**
 * Render a component like with `<slot>` as tag to contain content specified by html`...` bound with `context`,
 * or contain responsive content render by function like `() => html`...`` bound with `context`.
 */
export function render(renderer, context = null) {
    return new RenderedComponentLike(renderer, context);
}
/**
 * Same as an anonymous component, except it attaches to a context,
 * and render all the things within that context.
 */
export class RenderedComponentLike extends Component {
    /** `context` can be overwritten. */
    context;
    /** `renderer` can be overwritten. */
    renderer;
    /** Component generated from `getAs`. */
    componentRenderedAs = null;
    componentRenderedNeedsValidate = true;
    constructor(renderer, context, host = null) {
        super(host ?? document.createElement('slot'));
        this.renderer = renderer;
        this.context = context;
    }
    /** Replace context of content slot. */
    initContentSlot() {
        let position = new SlotPosition(0 /* SlotPositionType.AfterContent */, this.el);
        return new TemplateSlot(position);
    }
    render() {
        trackGet(this, 'renderer');
        if (typeof this.renderer === 'function') {
            return this.renderer.call(this.context);
        }
        else {
            return this.renderer;
        }
    }
    onUpdated() {
        super.onUpdated();
        this.componentRenderedNeedsValidate = true;
    }
    /**
     * Get the component bound with first rendered element.
     * E.g., render a popup or contextmenu based on current rendered.
     * Normally you should wait for render complete then get, or you will receive `null`.
     */
    getAs(cons) {
        if (!this.hasContentRendered()) {
            this.componentRenderedAs = null;
            return null;
        }
        if (this.componentRenderedNeedsValidate) {
            this.componentRenderedNeedsValidate = false;
            let firstElement = this.el.firstElementChild;
            // Re-rendered new component.
            if (firstElement && firstElement !== this.componentRenderedAs?.el) {
                let com = cons.from(firstElement);
                if (!com) {
                    throw new Error(`The "renderer" must render a "<${cons.name}>" type of component!`);
                }
                this.componentRenderedAs = com;
            }
        }
        return this.componentRenderedAs;
    }
}
