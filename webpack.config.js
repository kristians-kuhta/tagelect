const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
	test: /.m?js$/i,
	exclude: /node_modules/,
	use: {
	  loader: 'babel-loader',
	  options: {
	    presets: ['@babel/preset-env'],
	  }
	},
	test: /\.s[ac]ss$/i,
	use: [
	  // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
	]
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
