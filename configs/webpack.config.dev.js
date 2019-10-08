/**
 * Build config for development 
 */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge')
const baseConfig = require('./webpack.config.base')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const port = process.env.PORT || 1221;

module.exports = merge.smart(baseConfig, {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: './src/index.js',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
        ],
    },
    devServer: {
        contentBase: './dist',
        open: true,
        port
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Output Management',
        }),
    ]
});
