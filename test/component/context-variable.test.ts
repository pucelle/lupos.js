import {UpdateQueue} from '@pucelle/ff'
import {Component, addContextVariable, deleteContextVariables, getContextVariableDeclared} from '../../src'


describe('Test useContext', () => {

	test('useContext', async () => {
		class Parent extends Component {

			// @setContext
			prop: number = 1

			protected onConnected() {
				super.onConnected()
				addContextVariable(this, 'prop')
			}

			protected onDisconnected() {
				super.onDisconnected()
				deleteContextVariables(this)
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
				this.#propDeclared = getContextVariableDeclared(this, 'prop')
			}

			protected onDisconnected() {
				super.onDisconnected()
				this.#propDeclared = undefined
				deleteContextVariables(this)
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
