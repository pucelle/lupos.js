import { getTemplatePartParameter } from "../part.js";
import { SlotPositionMap } from "./slot-position-map.js";
/**
 * Help to cache template insert positions,
 * Especially manage positions when template insert and delete dynamically.
 */
const PositionMap = /*#__PURE__*/ new SlotPositionMap();
/**
 * Represents a template make from a template literal html`...`,
 * and bound with a context.
 */
export class Template {
    /**
     * Required, a template may be appended and wait to call connect callback.
     * It may be then updated to be removed and call disconnect callback immediately.
     */
    connected = false;
    el;
    maker;
    context;
    startInnerPosition;
    update;
    /** Part and it's position. */
    parts;
    /**
     * If `maker` is `null`, normally create template from `new Template(...)`,
     * not `Maker.make(...)`. then can only update by `slot.updateTemplateOnly(...)`.
     */
    constructor(initResult, maker = null, context = null) {
        this.maker = maker;
        this.context = context;
        this.el = initResult.el;
        this.startInnerPosition = initResult.position;
        this.parts = initResult.parts ?? [];
        this.update = initResult.update ?? noop;
    }
    /** Whether can use `result` to do update. */
    canUpdateBy(result) {
        return this.maker === result.maker && this.context === result.context;
    }
    afterConnectCallback(param) {
        if (this.connected) {
            return;
        }
        this.connected = true;
        for (let [part, position] of this.parts) {
            let partParam = getTemplatePartParameter(param, position);
            part.afterConnectCallback(partParam);
        }
    }
    beforeDisconnectCallback(param) {
        if (!this.connected) {
            return;
        }
        this.connected = false;
        let promises = [];
        for (let [part, position] of this.parts) {
            let partParam = getTemplatePartParameter(param, position);
            let p = part.beforeDisconnectCallback(partParam);
            if (p) {
                promises.push(p);
            }
        }
        if (promises.length > 0) {
            return Promise.all(promises);
        }
    }
    /**
     * Get first node of all the contents in current template.
     * Can only get when nodes exist in current template.
     * If cant find a node, returns `null`.
     */
    getFirstNode() {
        if (this.startInnerPosition.type === 1 /* SlotPositionType.Before */) {
            return this.startInnerPosition.target;
        }
        else {
            return this.startInnerPosition.target;
        }
    }
    /**
     * Insert all nodes of current template before a position.
     * Note you must ensure these nodes stay in current template, or been recycled.
     * Will not call connect callback, you should do it manually after current template updated.
     */
    insertNodesBefore(position) {
        position.insertNodesBefore(...this.el.content.childNodes);
        PositionMap.addPosition(this, position);
    }
    /**
     * Recycle nodes that was firstly created in current template,
     * move them back to current template.
     * Note you must ensure these nodes have been inserted to a position already.
     * Will call disconnect callback before recycling nodes.
     */
    async recycleNodes() {
        let promise = this.beforeDisconnectCallback(1 /* PartCallbackParameterMask.FromOwnStateChange */ | 2 /* PartCallbackParameterMask.AsDirectNode */);
        // Ensure be able to recycle nodes immediately if possible.
        if (promise) {
            await promise;
        }
        // Note here postpone recycling nodes for at least a micro task tick.
        let position = PositionMap.getPosition(this);
        let firstNode = this.getFirstNode();
        if (firstNode) {
            this.el.content.append(...position.walkNodesFrom(firstNode));
        }
        PositionMap.deletePosition(this, position);
    }
    /**
     * Move nodes that was first created in current template, to before a new position.
     * Note you must ensure these nodes have been inserted to a position.
     */
    moveNodesBefore(position) {
        let oldPosition = PositionMap.getPosition(this);
        if (oldPosition === position) {
            return;
        }
        let firstNode = this.getFirstNode();
        if (firstNode) {
            position.insertNodesBefore(...oldPosition.walkNodesFrom(firstNode));
        }
        PositionMap.deletePosition(this, oldPosition);
        PositionMap.addPosition(this, position);
    }
}
function noop() { }
