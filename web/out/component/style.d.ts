import { TemplateResult } from '../template';
/** Type of the values returned from `Component.style()`. */
export type ComponentStyle = TemplateResult | (() => TemplateResult);
/**
 * Add component style to document head as a style tag.
 *
 * It will be compiled to accept component declared style,
 * and returns the style as original static property.
 */
export declare function addComponentStyle(style: ComponentStyle, identifyName: string): ComponentStyle;
/**
 * Add a global style. compare to normal style codes, it can use variables and can be updated dynamically.
 * @param style: A string, or a template in css`...` format, or a function return these two.
 */
export declare function addGlobalStyle(style: ComponentStyle): void;
