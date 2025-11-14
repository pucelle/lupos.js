/**
 * `:class` binding will add class names to current element.
 * - `:class="class1 class2"` - Just like class name strings.
 * - `:class.className=${value}` - Add class name if `value` is `true` like. Support by compiler.
 * - `:class=${[class1, class2]}` - Add multiply class names from array.
 * - `:class=${{class1: value1, class2: value2}}` - Add multiply class names, whether add or remove depending on mapped values.
 *
 * Note: compiler may replace this binding to equivalent codes.
 */
export class ClassBinding {
    el;
    lastClassNames = [];
    /** Modifier `className` of `:class.className` will be replaced by compiler. */
    constructor(el) {
        this.el = el;
    }
    update(value) {
        if (Array.isArray(value)) {
            this.updateList(value);
        }
        else if (value && typeof value === 'object') {
            this.updateObject(value);
        }
        else if (typeof value === 'string') {
            this.updateString(value);
        }
    }
    /**
     * For compiling:
     * - `:class="abc"`.
     * - `:class=${value}` and `value` is inferred as object type.
     */
    updateString(value) {
        let names = value.split(/\s+/);
        this.updateList(names);
    }
    /**
     * For compiling:
     * - `:class.className=${booleanLike}`.
     * - `:class=${value}` and `value` is inferred as array type.
     */
    updateObject(value) {
        let names = [];
        for (let key of Object.keys(value)) {
            if (value[key]) {
                names.push(key);
            }
        }
        this.updateList(names);
    }
    /**
     * For compiling:
     * - `:class=${value}` and `value` is inferred as array type.
     */
    updateList(value) {
        value = value.filter(v => v);
        for (let name of this.lastClassNames) {
            if (!value.includes(name)) {
                this.el.classList.remove(name);
            }
        }
        for (let name of value) {
            if (!this.lastClassNames.includes(name)) {
                this.el.classList.add(name);
            }
        }
        this.lastClassNames = value;
    }
}
