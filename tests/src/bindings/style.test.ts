import * as lupos from '../../../web/out'
import {describe, it, expect} from 'vitest'


describe('Test :style', () => {
	it(':style=${...}', () => {
		let div = document.createElement('div')
		div.style.cssText = 'color: red'
		let b = new lupos.StyleBinding(div)

		b.update('background: #fff')
		expect(div.style.cssText).toEqual('color: red; background: rgb(255, 255, 255);')

		b.update('background: none')
		expect(div.style.cssText).toEqual('color: red; background: none;')
	})


	it(':style.name=${...}', () => {
		let div = document.createElement('div')
		div.style.cssText = 'color: red'
		let b = new lupos.StyleBinding(div)

		b.update({background: '#fff'})
		expect(div.style.cssText).toEqual('color: red; background: rgb(255, 255, 255);')

		b.update({background: 'none'})
		expect(div.style.cssText).toEqual('color: red; background: none;')
	})


	it(':style=${{...}}', () => {
		let div = document.createElement('div')
		div.style.cssText = 'color: red'
		let b = new lupos.StyleBinding(div)

		b.update({background: '#fff', flex: '1'})
		expect(div.style.cssText).toEqual('color: red; background: rgb(255, 255, 255); flex: 1 1 0%;')

		b.update({background: 'none'})
		expect(div.style.cssText).toEqual('color: red; background: none;')
	})
})