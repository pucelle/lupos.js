import {createIfBlockFn, createCacheableIfBlockFn} from './if'


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
export const createSwitchBlockFn = createIfBlockFn


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
export const createCacheableSwitchBlockFn = createCacheableIfBlockFn
