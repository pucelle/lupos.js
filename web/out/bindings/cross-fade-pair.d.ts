import { Binding } from './types';
import { Part } from '../part';
/**
 * `:crossFadePair` can bind an element to provide it's bounding rect for later crossfade transition,
 * but the element itself will not participate in crossfade transition.
 * - `<el :crossFadePair=${key | null}>`: key can be any type, which matches the key parameter of `:transition=${crossfade({key})}`
 */
export declare class crossFadePair implements Binding, Part {
    private readonly el;
    private key;
    private connected;
    constructor(el: Element);
    afterConnectCallback(): void;
    beforeDisconnectCallback(): Promise<void> | void;
    update(key: any): void;
}
