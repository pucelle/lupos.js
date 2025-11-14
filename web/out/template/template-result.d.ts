/** All template types. */
export type TemplateType = 'html' | 'css' | 'svg';
/**
 * Returns a HTML template literal, can be used to render or update a component.
 * Uses it like:
 *
 * ```ts
 * html`...`
 * ```
 *
 * It will be replaced to a `CompiledTemplateResult` object after compiled by `@pucelle/lupos-compiler`.
 */
export declare function html(strings: TemplateStringsArray, ...values: any[]): TemplateResult;
/**
 * Returns a SVG template literal, can be used to render or update a component.
 * Uses it like:
 *
 * ```ts
 * svg`...`
 * ```
 *
 * It will be replaced to a `CompiledTemplateResult` object after compiled by `@pucelle/lupos-compiler`.
 */
export declare function svg(strings: TemplateStringsArray, ...values: any[]): TemplateResult;
/**
 * Returns a CSS template literal, can be used as component's `static style` property.
 * Uses it like:
 *
 * ```ts
 * css`...`
 * ```
 */
export declare function css(strings: TemplateStringsArray, ...values: any[]): TemplateResult;
/**
 * Created from each html`...` or svg`...`.
 * Every time call `component.update` will generate a new template result,
 * then we will use this result to patch or replaced old one.
 */
export declare class TemplateResult {
    readonly type: TemplateType;
    readonly strings: TemplateStringsArray | string[];
    readonly values: any[];
    constructor(type: TemplateType, strings: TemplateStringsArray | string[], values: any[]);
    /**
     * Join strings and values to a string.
     * Note after compiled `html` or `svg` type template,
     * `toString()` is not available any more.
     */
    toString(): string;
}
