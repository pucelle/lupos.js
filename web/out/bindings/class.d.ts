import { Binding } from './types';
/** Object used for `:class=${{class1: value1, class2: value2}}` */
type ClassObject = Record<string, any>;
/**
 * `:class` binding will add class names to current element.
 * - `:class="class1 class2"` - Just like class name strings.
 * - `:class.className=${value}` - Add class name if `value` is `true` like. Support by compiler.
 * - `:class=${[class1, class2]}` - Add multiply class names from array.
 * - `:class=${{class1: value1, class2: value2}}` - Add multiply class names, whether add or remove depending on mapped values.
 *
 * Note: compiler may replace this binding to equivalent codes.
 */
export declare class ClassBinding implements Binding {
    private readonly el;
    private lastClassNames;
    /** Modifier `className` of `:class.className` will be replaced by compiler. */
    constructor(el: Element);
    update(value: string | string[] | ClassObject): void;
    /**
     * For compiling:
     * - `:class="abc"`.
     * - `:class=${value}` and `value` is inferred as object type.
     */
    updateString(value: string): void;
    /**
     * For compiling:
     * - `:class.className=${booleanLike}`.
     * - `:class=${value}` and `value` is inferred as array type.
     */
    updateObject(value: ClassObject): void;
    /**
     * For compiling:
     * - `:class=${value}` and `value` is inferred as array type.
     */
    updateList(value: string[]): void;
}
export {};
