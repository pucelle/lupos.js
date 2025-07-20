import {EffectMaker} from '@pucelle/lupos'
import {TemplateResult} from '../template'


/** Type of the values returned from `Component.style()`. */
export type ComponentStyle = TemplateResult | (() => TemplateResult)


/** 
 * Add component style to document head as a style tag.
 * 
 * It will be compiled to accept component declared style,
 * and returns the style as original static property.
 */
export function addComponentStyle(style: ComponentStyle, identifyName: string): ComponentStyle {
	createStyleElement(style, identifyName)
	return style
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
