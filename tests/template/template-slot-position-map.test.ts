import {SlotPositionType, SlotPosition, Template} from '../../src'
import {SlotPositionMap} from '../../src/template/slot-position-map'


describe('Test SlotPositionMap', () => {

	function createFakePosition(): SlotPosition<any> {
		return new SlotPosition(SlotPositionType.AfterContent, new Text())
	}

	function createFakeTemplate() {
		return new Template({el: document.createElement('template'), position: createFakePosition()})
	}

	test('SlotPositionMap', async () => {
		let m = new SlotPositionMap()

		let t1 = createFakeTemplate()
		let t2 = createFakeTemplate()
		let p = createFakePosition()

		m.addPosition(t1, p)
		expect(m.getPosition(t1)).toBe(p)

		m.addPosition(t2, p)
		expect(m.getPosition(t1)).toBe(t2.startInnerPosition)
		expect(m.getPosition(t2)).toBe(p)

		m.deletePosition(t2, p)
		expect(m.getPosition(t1)).toBe(p)
		expect(m.getPosition(t2)).toBe(undefined)
	})
})