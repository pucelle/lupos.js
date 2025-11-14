import { RenderedComponentLike } from "./component/render.js";
import { getComponentByElement } from "./component/from-element.js";
import { trackSet } from "@pucelle/lupos";
let HydrationRoot = null;
let CurrentWalker = null;
export function createHydrationWalker(root) {
    const stack = [];
    let container = root;
    let current = root.firstChild;
    const api = {
        get container() { return container; },
        set container(v) { container = v; },
        get current() { return current; },
        set current(v) { current = v; },
        peek() { return current; },
        advance() { current = current ? current.nextSibling : null; },
        claimNode() { const n = current; if (n)
            api.advance(); return n; },
        claimText() { const n = current; if (n && n.nodeType === 3) {
            api.advance();
            return n;
        } return null; },
        claimElement(tagName) {
            const n = current;
            if (n && n.nodeType === 1 && n.tagName.toLowerCase() === tagName.toLowerCase()) {
                api.advance();
                return n;
            }
            return null;
        },
        claimComment(dataStartsWith) {
            const n = current;
            if (n && n.nodeType === 8) {
                const d = n.data || '';
                if (d.startsWith(dataStartsWith)) {
                    api.advance();
                    return n;
                }
            }
            return null;
        },
        enterContainer(el) { stack.push({ container, next: current }); container = el; current = el.firstChild; },
        exitContainer() { const s = stack.pop(); if (s) {
            container = s.container;
            current = s.next;
        } },
        claimElementWithAttrs(tagName, attrs) {
            const el = api.claimElement(tagName);
            if (!el)
                return null;
            for (const [k, v] of Object.entries(attrs)) {
                if (typeof v === 'boolean') {
                    if (v && !el.hasAttribute(k))
                        return null;
                }
                else {
                    if (el.getAttribute(k) !== v)
                        return null;
                }
            }
            return el;
        },
        peekMarkerData() {
            const n = current;
            if (n && n.nodeType === 8)
                return n.data || '';
            return null;
        },
        claimTemplateStart() {
            const data = api.peekMarkerData();
            if (data && data.startsWith('lu:s'))
                return api.claimNode();
            return null;
        },
        claimTemplateEnd() {
            const data = api.peekMarkerData();
            if (data && data.startsWith('lu:e'))
                return api.claimNode();
            return null;
        },
        claimHole(index) {
            const data = api.peekMarkerData();
            if (data && data.startsWith('lu:x') && data.includes(`i=${index}`))
                return api.claimNode();
            return null;
        },
        claimListStart(index) {
            const data = api.peekMarkerData();
            if (data && data.startsWith('lu:list') && data.includes(`i=${index}:start`))
                return api.claimNode();
            return null;
        },
        claimListEnd(index) {
            const data = api.peekMarkerData();
            if (data && data.startsWith('lu:list') && data.includes(`i=${index}:end`))
                return api.claimNode();
            return null;
        },
    };
    return api;
}
export function beginHydration(root) {
    HydrationRoot = root;
    CurrentWalker = createHydrationWalker(root);
}
export function endHydration() {
    HydrationRoot = null;
    CurrentWalker = null;
}
export function isHydratingPosition(pos) {
    return !!HydrationRoot
        && pos.type === 0 /* SlotPositionType.AfterContent */
        && pos.target === HydrationRoot;
}
export function getHydrationWalker() {
    return CurrentWalker;
}
export function hydrate(root, renderable, context = null) {
    const host = root;
    const com = new RenderedComponentLike(renderable, context, host);
    if (host.firstChild) {
        host.replaceChildren();
    }
    beginHydration(host);
    com.afterConnectCallback(2 /* PartCallbackParameterMask.AsDirectNode */ | 8 /* PartCallbackParameterMask.MoveImmediately */);
    com.once('updated', () => endHydration());
    return com;
}
export function hydrateElement(el, Com, props) {
    let com = getComponentByElement(el);
    if (!com) {
        com = new Com(el);
        if (props) {
            Object.assign(com, props);
            trackSet(com, "");
        }
    }
    beginHydration(el);
    com.afterConnectCallback(2 /* PartCallbackParameterMask.AsDirectNode */ | 8 /* PartCallbackParameterMask.MoveImmediately */);
    com.once?.('updated', () => endHydration());
    return com;
}
