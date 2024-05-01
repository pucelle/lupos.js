import {Component, defineCustomElement} from '../../src/'


describe('Test Custom Element', () => {

	test('connecct', async () => {
		class Com extends Component {

			protected render() {
				return null
			}
		}

		defineCustomElement('my-com', Com)

		let el = document.createElement('my-com')
		document.body.append(el)

		// Jest jsdom environment hasn't implement custom element apis.
		// expect(Component.from(el)).toBeInstanceOf(Com)
	})
})