import { Binding } from './types';
/**
 * `:style` binding will add style values to target element.
 * - `:style="normalStyleProperties"` - Just like normal style properties.
 * - `:style.style-name=${value}` - Set style `style-name: value`.
 * - `:style.style-name.px=${numberValue}` - Set style `style-name: numberValue + px`. Support by compiler.
 * - `:style.style-name.percent=${numberValue}` - Set style `style-name: numberValue + %`. Support by compiler.
 * - `:style.style-name.url=${numberValue}` - Set style `style-name: url(numberValue)`. Support by compiler.
 * - `:style=${{styleName1: value1, styleName2: value2}}` - Set multiple styles from an object of properties and values.
 *
 * Note: compiler may replace this binding to equivalent codes.
 */
export declare class StyleBinding implements Binding {
    private readonly el;
    private lastStyleValues;
    /** Modifiers like `px`, `percent`, `url` was replaced by compiler. */
    constructor(el: Element);
    update(value: string | Record<string, string>): void;
    /**
     * For compiling from:
     * - `:style="abc"`.
     * - `:style=${value}` and `value` is inferred as object type.
     */
    updateString(value: string): void;
    /** Parse style string to object. */
    private parseStyleString;
    /**
     * For compiling from:
     * - `:style.style-name=${booleanLike}`.
     * - `:style=${value}` and `value` is inferred as array type.
     */
    updateObject(value: Record<string, string>): void;
}
