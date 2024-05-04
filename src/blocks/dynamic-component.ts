import {Component, ComponentConstructor} from '../component'
import {SlotRange, TemplateSlot} from '../template'
import {makeComponentTemplate} from '../template/template-makers'


/** Type of compiling statements like `<${DynamicComponent}>. */
type DynamicComponentBlock = (slot: TemplateSlot<null>, contentRange: SlotRange, context: any) => {
	update(Com: ComponentConstructor, values: any[]): void
}


/** Type of compiling bindings part of statements like `<${DynamicComponent} :class=${...}>. */
type DynamicComponentBindFn = (com: Component, context: any) => {
	update(values: any[]): void
}


/** 
 * Make it by compiling:
 * ```
 * 	<${DynamicComponent} ...>
 * ```
 */
export function createDynamicComponentBlockFn(bindFn: DynamicComponentBindFn): DynamicComponentBlock {
	return function(slot: TemplateSlot<null>, contentRange: SlotRange, context: any) {
		let Com: ComponentConstructor | null = null
		let bindUpdater: ReturnType<DynamicComponentBindFn> | null = null

		return {
			update(NewCom: ComponentConstructor, values: any[]) {
				if (NewCom !== Com) {
					let com = new NewCom()
					bindUpdater = bindFn(com, context)

					com.el.prepend(...contentRange.walkNodes())
					com.__applyRestSlotRange(contentRange)

					let template = makeComponentTemplate(com)
					slot.updateTemplateOnly(template, null)

					Com = NewCom
				}

				bindUpdater!.update(values)
			}
		}
	}
}
