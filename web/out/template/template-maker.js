import { Template } from "./template.js";
/** Compile from any html`...`. */
export class TemplateMaker {
    init;
    constructor(init) {
        this.init = init;
    }
    /** Bind with a context to create a Template. */
    make(context) {
        return new Template(this.init(context), this, context);
    }
    hydrate(context, walker) {
        void walker;
        return this.make(context);
    }
}
