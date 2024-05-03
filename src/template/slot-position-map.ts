import {Template} from './template'
import {SlotPosition} from './slot-position'


/** 
 * Cache where a template slot inserted,
 * and also update this position after new template insert into same position.
 */
export class SlotPositionMap {

	/** 
	 * Template <=> It's after position.
	 * It's equivalent to a double linked list.
	 * Can also use `TwoWayMap`, but use two maps indepently can avoid some useless operations.
	 */
	private tpmap: Map<Template, SlotPosition> = new Map()
	private ptmap: Map<SlotPosition, Template> = new Map()

	/** After insert a template before a position, remember relative position. */
	addPosition(template: Template<any>, position: SlotPosition) {
		let prevT = this.ptmap.get(position)
		if (prevT) {
			this.tpmap.set(prevT, template.startInnerPosition)
			this.ptmap.set(template.startInnerPosition, prevT)
		}

		this.tpmap.set(template, position)
		this.ptmap.set(position, template)
	}

	/** Get template position, the position where template located before. */
	getPosition(template: Template<any>): SlotPosition | undefined {
		return this.tpmap.get(template)
	}

	/** 
	 * Delete a template and it's cached position.
	 * - `position`: Known position of template.
	 */
	deletePosition(template: Template<any>, position: SlotPosition) {
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
