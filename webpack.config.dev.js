/**
 * webpack dev configuration
 */

const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const port = process.env.PORT || 5599;

module.exports = {
    // Chosen mode tells webpack to use its built-in optimizations accordingly.
    mode: 'development', // "production" | "development" | "none"

    // enhance debugging by adding meta info for the browser devtools
    // source-map most detailed at the expense of build speed.
    devtool: 'inline-source-map', // enum

    // defaults to ./src   
    entry: './src/index.js', // string | object | array

    // Here the application starts executing and webpack starts bundling 
    output: {
        filename: '[name].bundle.js', // the filename template for entry chunks
        path: path.resolve(__dirname, 'dist'), // the target directory for all output files - must be an absolute path (use the Node.js path module)
        publicPath: '/' // the url to the output directory resolved relative to the HTML page
    },

    // development server configuration
    devServer: {
        contentBase: './dist', // boolean | string | array, static file locati
        port,
        hot: true, // hot module replacement. Depends on HotModuleReplacementPlugin
        noInfo: true, // only errors & warns on hot reload
        historyApiFallback: true // true for index.html upon 404, object for multiple paths
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html",
        }),

        new BundleAnalyzerPlugin(),

        new CleanWebpackPlugin()
    ],

    // options for resolving module requests
    resolve: {
        // a list of module name aliases
        alias: {
            components: path.resolve(path.join(__dirname, 'src', 'components')),
            images: path.resolve(path.join(__dirname, 'src', 'assets', 'images')),
            styles: path.resolve(path.join(__dirname, 'src', 'assets', 'styles')),
        },
    },

    // configuration regarding modules
    module: {
        rules: [
            // rules for modules (configure loaders, parser options, etc.)
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    // the loader which should be applied, it'll be resolved relative to the context
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader', options: {
                            modules: true,
                        },
                    },
                ],
            },
            // sass support
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // creates `style` nodes from JS strings
                    'style-loader',
                    // translates CSS into CommonJS
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true
                        }
                    },
                    // compiles Sass to CSS
                    'sass-loader',
                ],
            },
            // WOFF Font
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        limit: 10000,
                        mimetype: 'application/font-woff'
                    }
                }
            },
            // WOFF2 Font
            {
                test: /\.(woff(2)?|ttf|otf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/'
                        }
                    }
                ]
            },
            // common Image Formats
            {
                test: /\.(?:ico|png|jpg|jpeg)$/,
                use: 'url-loader'
            }
        ],
    },
    performance: { hints: 'warning' }
};