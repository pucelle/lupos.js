import * as lupos from '../../../'
import {describe, it} from 'vitest'


describe('Test Custom Element', () => {

	it('Custom Element Connect', async () => {
		class Com extends lupos.Component {

			protected render() {
				return null
			}
		}

		lupos.defineCustomElement('my-com', Com)

		let el = document.createElement('my-com')
		document.body.append(el)

		// Jest jsdom environment hasn't implement custom element apis.
		// expect(Component.from(el)).toBeInstanceOf(Com)
	})
})