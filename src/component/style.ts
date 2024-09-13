import {createEffect} from '@pucelle/ff'
import {TemplateResult} from '../template'
import {ComponentConstructor} from './types'
import {Component} from './component'


/** Type of the values returned from `Component.style()`. */
export type ComponentStyle = TemplateResult | (() => TemplateResult)


/** Caches component constructors that already applied style. */
const ComponentStyleAndTagMap: WeakSet<ComponentConstructor> = new WeakSet()


/** 
 * Call after any instance of component constructor created,
 * to ensure it's relied styles appended into document.
 */
export function ensureComponentStyle(Com: ComponentConstructor) {
	if (Com.style && !ComponentStyleAndTagMap.has(Com)) {
		createStyleElement(Com.style, Com.name)
	}

	// Ensure style of super component.
	let superCom = Object.getPrototypeOf(Com)
	if (superCom && superCom !== Component) {
		ensureComponentStyle(superCom)
	}

	ComponentStyleAndTagMap.add(Com)
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

	createEffect(() => {
		styleTag.textContent = getStyleContent(style)
	})
	
	let scriptTag = document.head.querySelector('script')
	document.head.insertBefore(styleTag, scriptTag)
}


/** Get style text from static style property. */
function getStyleContent(style: ComponentStyle): string {
	if (typeof style === 'function') {
		style = style()
	}

	return String(style)
}


/** 
 * Add a global style. compare to normal style codes, it can use variables and can be updated dynamically.
 * @param style: A string, or a template in css`...` format, or a function return these two.
 */
export function addGlobalStyle(style: ComponentStyle) {
	createStyleElement(style, 'global')
}
