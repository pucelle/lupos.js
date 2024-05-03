import {createHTMLTemplateFn} from "./html-template-fn"
import {TemplateInitResult, TemplateMaker} from "./template-maker"
import {SlotPosition, SlotPositionType, SlotStartInnerPositionType} from "./slot-position"


/** Template has only a text node inside. */
const TextTemplateFn = createHTMLTemplateFn(' ')

/** Template has only a comment node inside. */
const CommentTemplateFn = createHTMLTemplateFn('<!---->')


/** Template maker to create a text node to update text content. */
export const TextTemplateMaker = new TemplateMaker(function() {
	let el = TextTemplateFn()
	let text = el.content.firstChild as Text
	let position = new SlotPosition<SlotStartInnerPositionType>(SlotPositionType.Before, text)

	return {
		el,
		position,
		update(values: [string]) {
			text.data = values[0]
		}
	} as TemplateInitResult
})


/** Template maker to update nodes. */
export const NodesTemplateMaker = new TemplateMaker(function() {
	let el = CommentTemplateFn()
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
		}
	} as TemplateInitResult
})

