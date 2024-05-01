import {TemplateSlotPositionType, TemplateSlotPosition, Template} from '../../src'
import {TemplateSlotPositionMap} from '../../src/template/template-slot-position-map'


describe('Test TemplateSlotPositionMap', () => {

	function createFakePosition(): TemplateSlotPosition<any> {
		return new TemplateSlotPosition(TemplateSlotPositionType.AfterContent, new Text())
	}

	function createFakeTemplate() {
		return new Template(null, {el: document.createElement('template'), position: createFakePosition()})
	}

	test('TemplateSlotPositionMap', async () => {
		let m = new TemplateSlotPositionMap()

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