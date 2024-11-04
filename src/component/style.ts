import {EffectMaker} from '@pucelle/ff'
import {TemplateResult} from '../template'
import {ComponentConstructor} from './types'


/** Type of the values returned from `Component.style()`. */
export type ComponentStyle = TemplateResult | (() => TemplateResult)


/** Caches component constructors that already applied style. */
const ComponentStyleAndTagMap: WeakSet<ComponentConstructor> = new WeakSet()


/** 
 * Call after any instance of component constructor created,
 * to ensure it's relied styles appended into document.
 */
export function ensureComponentStyle(Com: ComponentConstructor) {
	if (Com.hasOwnProperty('style') && !ComponentStyleAndTagMap.has(Com)) {
		ComponentStyleAndTagMap.add(Com)
		createStyleElement(Com.style!, Com.name)
	}
}


/** 
 * Create <style> element and insert it into document head.
 * `identifyName` should be `global` for global style.
 * Always insert it into before any script tags.
 * So you may put overwritten styles after script tag to avoid conflict.
 */
function createStyleElement(style: ComponentStyle, identifyName: string) {
	let styleTag = document.createElement('style')
	styleTag.setAttribute('name', identifyName)

	if (typeof style === 'function') {
		new EffectMaker(() => {
			styleTag.textContent = String((style as () => TemplateResult)())
		}).connect()
	}
	else {
		styleTag.textContent = String(style)
	}
	
	let scriptTag = document.head.querySelector('script')
	document.head.insertBefore(styleTag, scriptTag)
}


/** 
 * Add a global style. compare to normal style codes, it can use variables and can be updated dynamically.
 * @param style: A string, or a template in css`...` format, or a function return these two.
 */
export function addGlobalStyle(style: ComponentStyle) {
	createStyleElement(style, 'global')
}
