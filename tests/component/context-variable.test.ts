import {UpdateQueue} from '@pucelle/ff'
import {Component} from '../../src'


describe('Test useContext', () => {

	test('useContext & setContext', async () => {
		class Parent extends Component {

			// @setContext
			prop: number = 1

			protected onConnected() {
				super.onConnected()
				Parent.setContextVariable(this, 'prop')
			}

			protected onDisconnected() {
				super.onDisconnected()
				Parent.deleteContextVariables(this)
			}

			protected render() {
				return null
			}
		}

		class Child extends Component {

			#propDeclared: any | null = null

			// @useContext
			get prop(): number | undefined {
				return this.#propDeclared?.['prop']
			}

			protected onConnected() {
				super.onConnected()
				this.#propDeclared = Parent.getContextVariableDeclared(this, 'prop')
			}

			protected onDisconnected() {
				super.onDisconnected()
				this.#propDeclared = undefined
				Parent.deleteContextVariables(this)
			}

			protected render() {
				return null
			}
		}

		let parent = new Parent()
		let child = new Child()

		parent.el.append(child.el)
		parent.appendTo(document.body)
		child.afterConnectCallback(0)

		await UpdateQueue.untilComplete()
		expect(child.prop).toBe(1)

		parent.remove()
		child.beforeDisconnectCallback(0)
		await UpdateQueue.untilComplete()
		expect(child.prop).toBe(undefined)
	})
})
