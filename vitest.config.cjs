import { defineConfig } from 'vitest/config'
import path from 'node:path'


export default defineConfig({
	test: {
		environment: 'jsdom',
		include: ['tests/out/**/*.test.js'],
	},
	resolve: {
		alias: {
			'@pucelle/lupos.js': path.resolve(__dirname, './out'),
		},
	},
})