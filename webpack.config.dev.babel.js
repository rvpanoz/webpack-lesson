/**
 * webpack dev configuration  
 */

import path from 'path';
import { BundleAnalyzerPlugin} from 'webpack-bundle-analyzer'
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';

// define dev server port
const port = process.env.PORT || 5599;

const config = {
    // the environment in which the bundle should run
    target: "web", // enum

    // chosen mode tells webpack to use its built-in optimizations accordingly.
    mode: 'development', // "production" | "development" | "none"

    // enhance debugging by adding meta info for the browser devtools
    // source-map most detailed at the expense of build speed.
    // https://webpack.js.org/configuration/devtool/
    devtool: 'inline-source-map', // enum

    // defaults to ./src
    entry: ['./src/index.js'], // string | object | array

    // manually code splitting using entry points
    // entry: {
    //     index: './src/index',
    //     anotherEntry: './src/components/Entry'
    // },

    // https://webpack.js.org/configuration/stats/
    stats: {
        colors: true
    },

    // Here the application starts executing and webpack starts bundling 
    output: {
        filename: '[name].bundle.js', // the filename template for entry chunks
        path: path.resolve(__dirname, 'dist'), // the target directory for all output files - must be an absolute path (use the Node.js path module)
        chunkFilename: '[name].bundle.js', // determines the name of non-entry chunk files
        publicPath: '/' // the url to the output directory resolved relative to the HTML page
    },

    // development server configuration
    devServer: {
        contentBase: './dist', // boolean | string | array, static file locati
        port,
        hot: true, // hot module replacement
        noInfo: true, // only errors & warns on hot reload
        historyApiFallback: true // true for index.html upon 404, object for multiple paths
    },

    // plugins setup
    plugins: [

        //  generates an HTML file for your application by injecting automatically all your generated bundles.
        new HtmlWebpackPlugin({
            template: "./src/index.html",
        }),

        // visualize size of webpack output files with an interactive zoomable treemap.
        new BundleAnalyzerPlugin(),
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
                    'style-loader',
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
            // common image Formats
            {
                test: /\.(?:ico|png|jpg|jpeg)$/,
                use: 'url-loader'
            }
        ],
    },

     // shows performance hints
     performance: { hints: false },

     // optimization
     // https://webpack.js.org/guides/code-splitting/
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    // vendor chunk
                    name: "vendor",
                    // sync + async chunks
                    chunks: 'all',
                    // import file path containing node_modules
                    test: /node_modules/
                }
            }
        }
    }
};

export default config;