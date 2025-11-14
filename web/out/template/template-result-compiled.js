/**
 * Compile from html`...`,
 * it only caches compiled template maker and newly generated values.
 */
export class CompiledTemplateResult {
    maker;
    values;
    /**
     * Must bind original context.
     * E.g., generate by a render function in a list,
     * and get passed to a repeat component, it will bind  to the repeat.
     */
    context;
    constructor(maker, values, context) {
        this.maker = maker;
        this.values = values;
        this.context = context;
    }
    toString() {
        throw new Error(`Can't use "toString()" after "TemplateResult" compiled!`);
    }
}
