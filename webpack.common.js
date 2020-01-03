//run webpack-dev-server --content-base dist
//https://webpack.github.io/docs/configuration.html
const path = require('path');
const webpack = require('webpack');
module.exports = {
    entry: path.join(__dirname,'/src/index.js'),
	output:{
		path: path.resolve(__dirname,'dist'),
		filename:'bundle.js'
	},
	plugins: [
		new webpack.ProvidePlugin({
			jQuery: 'jquery',
			$: 'jquery',
			jquery: 'jquery'
		})
	],
	resolve: {
		modules: [
		  path.resolve(__dirname), path.resolve(__dirname, "node_modules")
		],
		alias: {
			"TweenLite": path.resolve('node_modules', 'gsap/src/uncompressed/TweenLite.js'),
			"TweenMax": path.resolve('node_modules', 'gsap/src/uncompressed/TweenMax.js'),
			"TimelineLite": path.resolve('node_modules', 'gsap/src/uncompressed/TimelineLite.js'),
			"TimelineMax": path.resolve('node_modules', 'gsap/src/uncompressed/TimelineMax.js'),
			"ScrollMagic": path.resolve('node_modules', 'scrollmagic/scrollmagic/uncompressed/ScrollMagic.js'),
			"animation.gsap": path.resolve('node_modules', 'scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap.js'),
			"debug.addIndicators": path.resolve('node_modules', 'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators.js')
		}
	},
	module:{
		rules:[
			{
				test: /\.jsx?$/,
				include: path.resolve(__dirname,'src'),
				use:{
					loader:'babel-loader',
					options:{
						presets:['es2015','react','stage-2']
					}
				}
			},
			{ 
				test: /\.css$/, 
				use:[
					'style-loader',
					'css-loader'
				]
			},
			{ test: /\.scss$/, loaders: ['style', 'css', 'postcss', 'sass'] },
			{ test: /\.woff(\d+)?$/, loader: 'url-loader?prefix=font/&limit=5000&mimetype=application/font-woff' },
			{ test: /bootstrap\/dist\/js\/umd\//, loader: 'imports?jQuery=jquery' },
         	{ test: /\.ttf$/, loader: 'file-loader?prefix=font/' },
         	{ test: /\.eot$/, loader: 'file-loader?prefix=font/' },
         	{ test: /\.svg$/, loader: 'file-loader?prefix=font/' },
         	{ test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff"},
         	{ test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" },
         	{ test: /\.(png|svg|jpg|gif)$/, loader:"file-loader"},
			{ test: /\.html$/, loader: 'file-loader?name=[name].[ext]'},
			 
		]
	}
}