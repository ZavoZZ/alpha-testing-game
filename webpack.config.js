//plugins
const { DefinePlugin } = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

//libraries
const path = require('path');

//the exported config function
module.exports = ({ production, analyze }) => {
	return {
		mode: production ? 'production' : 'development',
		entry: path.resolve(__dirname, 'client', 'client.jsx'),
		output: {
			path: path.resolve(__dirname, 'public'),
			publicPath: '/',
			filename: '[name].[chunkhash].js',
			sourceMapFilename: '[name].[chunkhash].js.map',
		},
		devtool: production ? false : 'eval-source-map',
		resolve: {
			extensions: ['.js', '.jsx'],
		},
		module: {
			rules: [
				{
					test: /\.(js|jsx)$/,
					exclude: /(node_modules)/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								presets: ['@babel/preset-env', '@babel/preset-react'],
							},
						},
					],
				},
				{
					test: /\.(css)$/,
					use: ['style-loader', 'css-loader'],
				},
			],
		},
		plugins: [
			new DefinePlugin({
				'process.env': {
					PRODUCTION: production,
					// Support both Docker and localhost development modes
					// Set DOCKER=true env var when running in Docker Compose
					NEWS_URI: production
						? `"${process.env.NEWS_URI}"`
						: `"${process.env.NEWS_URI || (process.env.DOCKER ? 'http://news-server:3200' : 'http://localhost:3200')}"`,
					AUTH_URI: production
						? `"${process.env.AUTH_URI}"`
						: `"${process.env.AUTH_URI || (process.env.DOCKER ? 'http://auth-server:3100' : 'http://localhost:3100')}"`,
					CHAT_URI: production
						? `"${process.env.CHAT_URI}"`
						: `"${process.env.CHAT_URI || (process.env.DOCKER ? 'http://chat-server:3300' : 'http://localhost:3300')}"`,
				},
			}),
			new CleanWebpackPlugin({
				cleanOnceBeforeBuildPatterns: ['*', '!content*'],
			}),
			new HtmlWebpackPlugin({
				template: './client/template.html',
				minify: {
					collapseWhitespace: production,
					removeComments: production,
					removeAttributeQuotes: production,
				},
			}),
			new CompressionPlugin({
				filename: '[path][base].gz[query]',
				algorithm: 'gzip',
				test: /\.js$|\.css$/,
				minRatio: 0.8,
			}),
			new BundleAnalyzerPlugin({
				analyzerMode: analyze ? 'server' : 'disabled',
			}),
		],
		devServer: {
			hot: true,
			host: '0.0.0.0', // Required for Docker
			port: 3001,
			client: {
				overlay: {
					errors: true,
					warnings: true,
				},
			},

			watchFiles: {
				options: {
					ignored: ['node_modules/**'],
				},
			},

			proxy: [
				{
					context: ['/api'],
					target: process.env.API_PROXY_URL || 'http://app:3000',
				},
			],

			static: '/public',

			historyApiFallback: true,
		},
	};
};
