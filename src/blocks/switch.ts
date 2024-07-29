import {CacheableIfBlockMaker, IfBlockMaker} from './if'


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
export const SwitchBlockMaker = IfBlockMaker


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
export const CacheableSwitchBlockMaker = CacheableIfBlockMaker
