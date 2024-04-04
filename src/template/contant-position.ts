import {ContentSlot} from './content-slot'


/** Contents that can be included in a `<tag>${...}<.tag>`. */
export enum ContentPositionType {

	/** Start or end position collapse with container element. */
	AfterBegin,
	BeforeEnd,

	/** Start or end position collapse with end or start of sibling node. */
	Before,
	After,

	/** Start or end position collapse with end or start of content slot. */
	BeforeSlot,
	AfterSlot,
}

export type ContentStartPositionType = ContentPositionType.Before | ContentPositionType.BeforeSlot | ContentPositionType.AfterBegin
export type ContentEndPositionType = ContentPositionType.After | ContentPositionType.AfterSlot | ContentPositionType.BeforeEnd


/** Start or end position collapse with container element. */
export class ContentPosition<T = ContentPositionType> {

	type: T
	target: Element | Node | ContentSlot

	constructor(type: T, target: Element | Node | ContentSlot) {
		this.type = type
		this.target = target
	}
}
