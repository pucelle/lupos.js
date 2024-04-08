import {make_if_statement, make_if_statement_cacheable} from './if'


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
export const make_switch_statement = make_if_statement


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
export const make_switch_statement_cacheable = make_if_statement_cacheable
