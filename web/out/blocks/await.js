/**
 * Make it by compiling:
 * ```html
 * 	<lu:await ${...}>...</lu:await>
 * 	<lu:then>...</lu:then>
 * 	<lu:catch>...</lu:catch>
 * ```
 */
export class AwaitBlock {
    makers;
    slot;
    context;
    promise = null;
    values = null;
    template = null;
    constructor(makers, slot, context) {
        this.makers = makers;
        this.slot = slot;
        this.context = context;
    }
    /**
     * Note update await block or resolve awaiting promise must wait
     * for a micro task tick, then template will begin to update.
     */
    update(promise, values) {
        this.values = values;
        if (promise !== this.promise) {
            this.updateIndex(0);
            promise.then(() => {
                this.updateIndex(1);
            })
                .catch(() => {
                this.updateIndex(2);
            });
            this.promise = promise;
        }
        else if (this.template) {
            this.template.update(values);
        }
    }
    updateIndex(index) {
        let maker = this.makers[index];
        this.template = maker ? maker.make(this.context) : null;
        this.slot.updateExternalTemplate(this.template, this.values);
    }
}
