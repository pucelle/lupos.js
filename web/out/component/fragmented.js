import { Component } from "./component.js";
import { trackGet } from "@pucelle/lupos";
/**
 * It accepts a `renderFn` to render contents,
 * and update independently as a component.
 *
 * So when you want to a small part that update frequently to get updated independently,
 * Wrap this part to a render function, and render it as a `<Fragmented>`.
 */
export class Fragmented extends Component {
    renderFn;
    render() {
        trackGet(this, "renderFn");
        return this.renderFn();
    }
}
