import { CacheableIfBlock, IfBlock } from './if';
/**
 * Make it by compiling:
 * ```html
 * 	<lu:switch ${...}>
 * 		<lu:case ${...}>...</lu:case>
 * 		<lu:case ${...}>...</lu:case>
 * 		<lu:default>...</lu:default>
 *  </switch>
 * ```
 */
export declare const SwitchBlock: typeof IfBlock;
/**
 * Make it by compiling:
 * ```html
 * 	<lu:switch ${...} cache>
 * 		<lu:case ${...}>...</lu:case>
 * 		<lu:case ${...}>...</lu:case>
 * 		<lu:default>...</lu:default>
 *  </lu:switch>
 * ```
 */
export declare const CacheableSwitchBlock: typeof CacheableIfBlock;
