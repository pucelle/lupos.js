import {TemplateSlot} from '../template'


/** 
 * Type of compiling all the statement like `<if>...`, `<switch>...`.
 * It returns a function, call which returns a template.
 */
export type BlockStatement = (slot: TemplateSlot, context: any) => {
	update: (values: any[]) => void
}