import { HTMLMaker } from "./html-maker.js";
import { TemplateMaker } from "./template-maker.js";
import { SlotPosition } from "./slot-position.js";
import { Template } from "./template.js";
/** Template has only a text node inside. */
const TextMaker = /*#__PURE__*/ new HTMLMaker(' ');
/** Template has only a comment node inside. */
const CommentMaker = /*#__PURE__*/ new HTMLMaker('<!---->');
/** Template maker to create a text node to update text content. */
export const TextTemplateMaker = /*#__PURE__*/ new TemplateMaker(function () {
    let el = TextMaker.make();
    let textNode = el.content.firstChild;
    let position = new SlotPosition(1 /* SlotPositionType.Before */, textNode);
    return {
        el,
        position,
        update([text]) {
            textNode.data = text;
        }
    };
});
TextTemplateMaker.hydrate = function (context, walker) {
    void context;
    let n = walker.claimText();
    if (!n) {
        return TextTemplateMaker.make(null);
    }
    let el = document.createElement('template');
    let position = new SlotPosition(1 /* SlotPositionType.Before */, n);
    return new Template({
        el,
        position,
        update([text]) {
            n.data = text;
        }
    }, TextTemplateMaker, null);
};
/**
 * Template maker to update a single node inside.
 * Note the parts inside of `nodes` are not included in the returned template,
 * so can't automatically call their connect and disconnect callbacks.
 * Fit for containing nodes which have been registered as parts, like slot elements.
 */
export const NodeTemplateMaker = /*#__PURE__*/ new TemplateMaker(function () {
    let el = CommentMaker.make();
    let comment = el.content.firstChild;
    let startInnerPosition = new SlotPosition(1 /* SlotPositionType.Before */, comment);
    let lastNode = null;
    return {
        el,
        position: startInnerPosition,
        update([node]) {
            if (node === lastNode) {
                return;
            }
            if (lastNode) {
                lastNode.remove();
            }
            if (node) {
                comment.after(node);
            }
            lastNode = node;
        },
    };
});
NodeTemplateMaker.hydrate = function (context, walker) {
    void context;
    let el = document.createElement('template');
    let anchor = walker.claimNode() || document.createComment('');
    if (!(anchor instanceof Comment)) {
        let c = document.createComment('');
        anchor.before(c);
        anchor = c;
    }
    let comment = anchor;
    let position = new SlotPosition(1 /* SlotPositionType.Before */, comment);
    let lastNode = null;
    return new Template({
        el,
        position,
        update([node]) {
            if (node === lastNode) {
                return;
            }
            if (lastNode) {
                lastNode.remove();
            }
            if (node) {
                comment.after(node);
            }
            lastNode = node;
        },
    }, NodeTemplateMaker, null);
};
/**
 * Make a template to contain only a component inside as it's part.
 * It can automatically call the connect and disconnect callbacks of the component.
 */
export function makeTemplateByComponent(com) {
    let el = document.createElement('template');
    let position = new SlotPosition(1 /* SlotPositionType.Before */, com.el);
    el.content.append(com.el);
    return new Template({
        el,
        position,
        parts: [[com, 1 /* PartPositionType.DirectNode */]],
    }, null, null);
}
