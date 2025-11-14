import { Binding } from './types';
/**
 * `:html` binding will update `innerHTML` property of current element.
 * Note html codes will replace to safe codes.
 * - `:html=${HTMLCodes}`
 */
export declare class HTMLBinding implements Binding {
    private readonly el;
    constructor(el: Element);
    update(value: string | number | null | undefined): void;
}
