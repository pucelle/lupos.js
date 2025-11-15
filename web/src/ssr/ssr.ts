/** Whether in SSR environment. */
export let inSSR = false


/** Update `inSSR` variable, only for SSR env. */
export function resetInSSR(value: boolean) {
	inSSR = value
}