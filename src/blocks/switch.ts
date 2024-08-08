import {CacheableIfBlock, IfBlock} from './if'


/** 
 * Make it by compiling:
 * ```
 * 	<switch ${...}>
 * 		<case ${...}>...</case>
 * 		<case ${...}>...</case>
 * 		<default>...</default>
 *  </switch>
 * ```
 */
export const SwitchBlock = IfBlock


/** 
 * Make it by compiling:
 * ```
 * 	<switch ${...} cache>
 * 		<case ${...}>...</case>
 * 		<case ${...}>...</case>
 * 		<default>...</default>
 *  </switch>
 * ```
 */
export const CacheableSwitchBlock = CacheableIfBlock
