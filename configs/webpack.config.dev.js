/**
 * Build config for development 
 */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge')
const baseConfig = require('./webpack.config.base')

const port = process.env.PORT || 1221;

module.exports = merge.smart(baseConfig, {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: './src/index.js',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        contentBase: './dist',
        open: true,
        port
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Webpack lesson',
        }),
    ]
});
