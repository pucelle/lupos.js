const path = require('path')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')


module.exports = (env) => {
	let filename = 'js/bundle.js'
	let outputPath = path.resolve(__dirname, 'dist')

	return {
		entry: ['./docs/index.ts'],
		mode: env.production ? 'production' : 'development',
		target: 'web',
		output: {
			filename,
			path: outputPath,
		},
		optimization: {},
		plugins: [
			new ForkTsCheckerWebpackPlugin(),
		],
		devServer: {
			static: path.resolve(__dirname, 'docs'),
			historyApiFallback: {
				index: 'index.html'
			},
			allowedHosts: 'all',
		},
		devtool: 'cheap-source-map',
		resolve: {
			extensions: ['.tsx', '.ts', '.js'],
			alias: {},
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					loader: 'ts-loader',
					options: {

						// Skip type checking when compiling.
						transpileOnly: true,
					},
					exclude: /node_modules/
				},

				// Can resolve esm module path.
				{
					test: /\.m?js/,
					resolve: {
						fullySpecified: false
					}
				},
			],
		},
	}
}