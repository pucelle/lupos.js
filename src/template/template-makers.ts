import {HTMLMaker} from './html-maker'
import {TemplateInitResult, TemplateMaker} from './template-maker'
import {SlotPosition, SlotPositionType, SlotStartInnerPositionType} from './slot-position'
import {Component} from '../component'
import {PartCallbackParameterMask} from '../types'
import {Template} from './template'


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
 * Template maker to update nodes inside.
 * Note the parts inside of `nodes` are not included in the returned template,
 * so can't automatically call their connect and disconnect callbacks.
 * Fit for containing nodes which have been registered as parts, like slot elements.
 */
export const NodesTemplateMaker = new TemplateMaker(function() {
	let el = CommentMaker.make()
	let comment = el.content.firstChild as Comment
	let position = new SlotPosition<SlotStartInnerPositionType>(SlotPositionType.Before, comment)
	let endNode: ChildNode | null = null

	return {
		el,
		position,
		update(nodes: ChildNode[]) {
			let node = endNode

			while (node) {
				let nextNode = node.previousSibling
				node.remove()

				if (nextNode === comment) {
					break
				}

				node = nextNode
			}

			if (nodes.length > 0) {
				comment.after(...nodes)
				endNode = nodes[nodes.length - 1]
			}
			else {
				endNode = null
			}
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
		parts: [[com, PartCallbackParameterMask.DirectNodeToMove & PartCallbackParameterMask.HappenInCurrentContext]],
	})
}
