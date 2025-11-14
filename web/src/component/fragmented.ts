import {Component} from './component'
import {RenderResult} from './types'


/** 
 * It accepts a `renderFn` to render contents,
 * and update independently as a component.
 * 
 * So when you want to a small part that update frequently to get updated independently,
 * Wrap this part to a render function, and render it as a `<Fragmented>`.
 */
export class Fragmented extends Component {
	
	renderFn!: () => RenderResult

	protected override render() {
		return this.renderFn()
	}
}