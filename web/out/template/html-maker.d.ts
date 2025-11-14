/**
 * Create a template maker from inner html string.
 * Call the returned function to get a template element containing the html content.
 */
export declare class HTMLMaker {
    private html;
    private wrapped;
    private node;
    constructor(html: string, wrapped?: boolean);
    make(): HTMLTemplateElement;
}
