/**
 * Make it by compiling:
 * ```html
 * 	<lu:if ${...}>...</lu:if>
 * 	<lu:elseif ${...}>...</lu:elseif>
 * 	<lu:else>...</lu:else>
 * ```
 */
export class IfBlock {
    slot;
    constructor(slot) {
        this.slot = slot;
    }
    update(result) {
        this.slot.update(result);
    }
}
/**
 * Make it by compiling:
 * ```html
 * 	<lu:if ${...} cache>...</lu:if>
 * 	<lu:elseif ${...}>...</lu:elseif>
 * 	<lu:else>...</lu:else>
 * ```
 */
export class CacheableIfBlock {
    slot;
    templates = new Map();
    constructor(slot) {
        this.slot = slot;
    }
    update(result) {
        let template = result ? this.templates.get(result.maker) ?? null : null;
        if (!template && result) {
            template = result.maker.make(result.context);
            this.templates.set(result.maker, template);
        }
        this.slot.updateExternalTemplate(template, result ? result.values : []);
    }
}
