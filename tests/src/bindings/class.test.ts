import * as lupos from '../../../'
import {describe, it, expect} from 'vitest'


describe('Test :class', () => {
	it(':class=${...}', () => {
		let div = document.createElement('div')
		div.className = 'c'
		let b = new lupos.ClassBinding(div)

		b.update('c1')
		expect(div.className).toEqual('c c1')

		b.update('c2')
		expect(div.className).toEqual('c c2')
	})


	it(':class=${[...]}', () => {
		let div = document.createElement('div')
		div.className = 'c'
		let b = new lupos.ClassBinding(div)

		b.update(['c1', 'c2'])
		expect(div.className).toEqual('c c1 c2')

		b.update(['c2', 'c3'])
		expect(div.className).toEqual('c c2 c3')
	})


	it(':class=${{...}}', () => {
		let div = document.createElement('div')
		div.className = 'c'
		let b = new lupos.ClassBinding(div)

		b.update({c1: true, c2: true})
		expect(div.className).toEqual('c c1 c2')

		b.update({c1: false, c2: true})
		expect(div.className).toEqual('c c2')
	})

	
	it(':class.name=${...}', () => {
		let div = document.createElement('div')
		div.className = 'c'
		let b = new lupos.ClassBinding(div)

		b.update({c1: true})
		expect(div.className).toEqual('c c1')

		b.update({c1: false})
		expect(div.className).toEqual('c')
	})
})