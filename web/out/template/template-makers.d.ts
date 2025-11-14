import { TemplateMaker } from './template-maker';
import { Component } from '../component';
import { Template } from './template';
/** Template maker to create a text node to update text content. */
export declare const TextTemplateMaker: TemplateMaker;
/**
 * Template maker to update a single node inside.
 * Note the parts inside of `nodes` are not included in the returned template,
 * so can't automatically call their connect and disconnect callbacks.
 * Fit for containing nodes which have been registered as parts, like slot elements.
 */
export declare const NodeTemplateMaker: TemplateMaker;
/**
 * Make a template to contain only a component inside as it's part.
 * It can automatically call the connect and disconnect callbacks of the component.
 */
export declare function makeTemplateByComponent(com: Component): Template;
