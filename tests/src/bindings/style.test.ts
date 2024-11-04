import * as lupos from '../../../'


describe('Test :style', () => {
	test(':style=${...}', () => {
		let div = document.createElement('div')
		div.style.cssText = 'color: red'
		let b = new lupos.StyleBinding(div)

		b.update('background: #fff')
		expect(div.style.cssText).toEqual('color: red; background: rgb(255, 255, 255);')

		b.update('background: none')
		expect(div.style.cssText).toEqual('color: red; background: none;')
	})


	test(':style.name=${...}', () => {
		let div = document.createElement('div')
		div.style.cssText = 'color: red'
		let b = new lupos.StyleBinding(div)

		b.update({background: '#fff'})
		expect(div.style.cssText).toEqual('color: red; background: rgb(255, 255, 255);')

		b.update({background: 'none'})
		expect(div.style.cssText).toEqual('color: red; background: none;')
	})


	test(':style=${{...}}', () => {
		let div = document.createElement('div')
		div.style.cssText = 'color: red'
		let b = new lupos.StyleBinding(div)

		b.update({background: '#fff', flex: '1'})
		expect(div.style.cssText).toEqual('color: red; background: rgb(255, 255, 255); flex: 1;')

		b.update({background: 'none'})
		expect(div.style.cssText).toEqual('color: red; background: none;')
	})
})