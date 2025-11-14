/**
 * `:html` binding will update `innerHTML` property of current element.
 * Note html codes will replace to safe codes.
 * - `:html=${HTMLCodes}`
 */
export class HTMLBinding {
    el;
    constructor(el) {
        this.el = el;
    }
    update(value) {
        this.el.innerHTML = value === null || value === undefined
            ? ''
            : cleanUnsafeHTML(String(value));
    }
}
/** Clean all unsafe html tags and events, like `<script>`, `onerror=...` */
function cleanUnsafeHTML(html) {
    return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script\s*>/gi, '')
        .replace(/<\w+[\s\S]*?>/g, function (m0) {
        return m0.replace(/\s*on\w+\s*=\s*(['"])?.*?\1/g, '');
    });
}
