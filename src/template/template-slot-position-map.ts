import {Template} from './template'
import {TemplateSlotPosition} from './template-slot-position'


/** 
 * Cache where a template slot inserted,
 * and also update this position after new template insert into same position.
 */
export class TemplateSlotPositionMap {

	/** 
	 * Template <=> It's after position.
	 * It's equivalent to a double linked list.
	 * Can also use `TwoWayMap`, but use two maps indepently can avoid some useless operations.
	 */
	private tpmap: Map<Template, TemplateSlotPosition> = new Map()
	private ptmap: Map<TemplateSlotPosition, Template> = new Map()

	/** Insert a template before a position. */
	addPosition(template: Template, position: TemplateSlotPosition) {
		let prevT = this.ptmap.get(position)
		if (prevT) {
			this.tpmap.set(prevT, template.startInnerPosition)
			this.ptmap.set(template.startInnerPosition, prevT)
		}

		this.tpmap.set(template, position)
		this.ptmap.set(position, template)
	}

	/** Get template position, the position where template located before. */
	getPosition(template: Template): TemplateSlotPosition | undefined {
		return this.tpmap.get(template)
	}

	/** 
	 * Delete a template and it's cached position.
	 * - `position`: Known position of template.
	 */
	deletePosition(template: Template, position: TemplateSlotPosition) {
		let prevT = this.ptmap.get(template.startInnerPosition)

		if (prevT) {
			this.tpmap.delete(template)
			this.ptmap.delete(template.startInnerPosition)

			this.tpmap.set(prevT, position)
			this.ptmap.set(position, prevT)
		}
		else {
			this.tpmap.delete(template)
			this.ptmap.delete(position)
		}
	}
}
