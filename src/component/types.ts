import {CompiledTemplateResult, TemplateResult} from '../template'
import {Component} from './component'
import {ComponentStyle} from './style'


/** Constructor of component. */
export interface ComponentConstructor {
	style: ComponentStyle | null
	new(props: Record<string, any>, el: Element): Component
}

/** Type of `render` method or function. */
export type RenderResult = TemplateResult | TemplateResult[] | CompiledTemplateResult | CompiledTemplateResult[] | string | null