import {HTMLMaker} from './html-maker'
import {TemplateInitResult, TemplateMaker} from './template-maker'
import {SlotPosition, SlotPositionType, SlotStartInnerPositionType} from './slot-position'
import {Component} from '../component'
import {Template} from './template'
import {PartPositionType} from '../part'


/** Template has only a text node inside. */
const TextMaker = new HTMLMaker(' ')

/** Template has only a comment node inside. */
const CommentMaker = new HTMLMaker('<!---->')


/** Template maker to create a text node to update text content. */
export const TextTemplateMaker = new TemplateMaker(function() {
	let el = TextMaker.make()
	let textNode = el.content.firstChild as Text
	let position = new SlotPosition<SlotStartInnerPositionType>(SlotPositionType.Before, textNode)

	return {
		el,
		position,
		update([text]: [string]) {
			textNode.data = text
		}
	} as TemplateInitResult
})


/** 
 * Template maker to update a single node inside.
 * Note the parts inside of `nodes` are not included in the returned template,
 * so can't automatically call their connect and disconnect callbacks.
 * Fit for containing nodes which have been registered as parts, like slot elements.
 */
export const NodeTemplateMaker = new TemplateMaker(function() {
	let el = CommentMaker.make()
	let comment = el.content.firstChild as Comment
	let startInnerPosition = new SlotPosition<SlotStartInnerPositionType>(SlotPositionType.Before, comment)
	let lastNode: ChildNode | null = null

	return {
		el,
		position: startInnerPosition,
		update([node]: [ChildNode | null]) {
			if (node === lastNode) {
				return
			}

			if (lastNode) {
				lastNode.remove()
			}

			if (node) {
				comment.after(node)
			}
			
			lastNode = node
		},
	} as TemplateInitResult
})


/** 
 * Make a template to contain only a component inside as it's part.
 * It can automatically call the connect and disconnect callbacks of the component.
 */
export function makeTemplateByComponent(com: Component): Template {
	let el = document.createElement('template')
	let position = new SlotPosition<SlotStartInnerPositionType>(SlotPositionType.Before, com.el)

	el.content.append(com.el)

	return new Template({
		el,
		position,
		parts: [[com, PartPositionType.DirectNode]],
	})
}
