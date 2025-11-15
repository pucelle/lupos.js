/** Whether in SSR environment. */
export let inSSR = false


/** Update `inSSR` variable, only for SSR env. */
export function updateInSSR(value: boolean) {
	inSSR = value
}