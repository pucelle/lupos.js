import { RenderedComponentLike } from './component/render';
import { ComponentConstructor } from './component/types';
import { SlotPosition } from './template/slot-position';
export interface HydrationWalker {
    container: Element;
    current: ChildNode | null;
    peek(): ChildNode | null;
    advance(): void;
    claimNode(): ChildNode | null;
    claimText(): Text | null;
    claimElement(tagName: string): Element | null;
    claimComment(dataStartsWith: string): Comment | null;
    enterContainer(el: Element): void;
    exitContainer(): void;
    claimElementWithAttrs(tagName: string, attrs: Record<string, string | boolean>): Element | null;
    peekMarkerData(): string | null;
    claimTemplateStart(): Comment | null;
    claimTemplateEnd(): Comment | null;
    claimHole(index: number): Comment | null;
    claimListStart(index: number): Comment | null;
    claimListEnd(index: number): Comment | null;
}
export declare function createHydrationWalker(root: Element): HydrationWalker;
export declare function beginHydration(root: Element): void;
export declare function endHydration(): void;
export declare function isHydratingPosition(pos: SlotPosition): boolean;
export declare function getHydrationWalker(): HydrationWalker | null;
export declare function hydrate(root: Element, renderable: any, context?: any): RenderedComponentLike<any>;
export declare function hydrateElement<T extends ComponentConstructor>(el: HTMLElement, Com: T, props?: Record<string, any>): InstanceType<T>;
