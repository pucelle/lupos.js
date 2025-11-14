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
export function html(strings, ...values) {
    return new TemplateResult('html', strings, values);
}
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
export function svg(strings, ...values) {
    return new TemplateResult('svg', strings, values);
}
/**
 * Returns a CSS template literal, can be used as component's `static style` property.
 * Uses it like:
 *
 * ```ts
 * css`...`
 * ```
 */
export function css(strings, ...values) {
    return new TemplateResult('css', strings, values);
}
/**
 * Created from each html`...` or svg`...`.
 * Every time call `component.update` will generate a new template result,
 * then we will use this result to patch or replaced old one.
 */
export class TemplateResult {
    type;
    strings;
    values;
    constructor(type, strings, values) {
        this.type = type;
        this.strings = strings;
        this.values = values;
    }
    /**
     * Join strings and values to a string.
     * Note after compiled `html` or `svg` type template,
     * `toString()` is not available any more.
     */
    toString() {
        let text = this.strings[0];
        for (let i = 0; i < this.strings.length - 1; i++) {
            let value = this.values[i];
            if (value !== null && value !== undefined) {
                if (Array.isArray(value)) {
                    text += value.join('');
                }
                else {
                    text += String(value);
                }
            }
            text += this.strings[i + 1];
        }
        return text;
    }
}
