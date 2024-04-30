module.exports = {
	preset: 'ts-jest/presets/js-with-ts-esm',
	transformIgnorePatterns: [
        'node_modules/(?!@pucelle/ff)' 
    ],
	testEnvironment: "jsdom",
	testMatch: [
		"**/test/**/*.test.ts"
	]
}