import {UpdateQueue} from '@pucelle/lupos'
import {render, RenderResult} from '../../src'
import {ensureDOM} from './dom'


export async function renderToString(toRender: RenderResult): Promise<string> {
	ensureDOM()

	let rendered = render(toRender)
	rendered.connectManually()
	await UpdateQueue.untilAllComplete()
	
	return rendered.el.innerHTML
}
