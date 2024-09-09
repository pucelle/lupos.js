module.exports = {
	transformIgnorePatterns: [
    	'node_modules/(?!@pucelle/ff)'
    ],
	testEnvironment: 'jsdom',
	testMatch: [
		'**/tests/**/*.test.js'
	],
	moduleNameMapper: {
		'@pucelle/lupos.js': '<rootDir>/out',
	},
}