import { deleteCrossFadeElementForPairOnly, setCrossFadeElementForPairOnly } from "../transition/index.js";
/**
 * `:crossFadePair` can bind an element to provide it's bounding rect for later crossfade transition,
 * but the element itself will not participate in crossfade transition.
 * - `<el :crossFadePair=${key | null}>`: key can be any type, which matches the key parameter of `:transition=${crossfade({key})}`
 */
export class crossFadePair {
    el;
    key = null;
    connected = false;
    constructor(el) {
        this.el = el;
    }
    afterConnectCallback() {
        if (this.connected) {
            return;
        }
        this.connected = true;
        if (this.key !== null) {
            setCrossFadeElementForPairOnly(this.key, this.el);
        }
    }
    beforeDisconnectCallback() {
        if (!this.connected) {
            return;
        }
        this.connected = false;
        if (this.key !== null) {
            deleteCrossFadeElementForPairOnly(this.key, this.el);
        }
    }
    update(key) {
        if (this.connected) {
            if (this.key) {
                deleteCrossFadeElementForPairOnly(this.key, this.el);
            }
            setCrossFadeElementForPairOnly(key, this.el);
        }
        this.key = key;
    }
}
