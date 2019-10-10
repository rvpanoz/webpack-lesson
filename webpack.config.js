/**
 * webpack configuration
 */

const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

// define dev server port
const port = process.env.PORT || 1221;

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './src/index.js',
  output: {
    filename: '[name]-[hash].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/' // for react-router
  },
  devServer: {
    contentBase: './dist',
    open: true,
    port,
    historyApiFallback: true // for react-router
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),

    new BundleAnalyzerPlugin()
  ],
  resolve: {
    alias: {
      components: path.resolve(path.join(__dirname, 'src', 'components')),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
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
      // Common Image Formats
      {
        test: /\.(?:ico|png|jpg|jpeg)$/,
        use: 'url-loader'
      }
    ],
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

            // npm package names are URL-safe, but some servers don't like @ symbols
            return `npm.${packageName.replace('@', '')}`;
          },
        },
      }
    }
  },
};