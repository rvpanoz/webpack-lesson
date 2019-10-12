/**
 * webpack configuration
 */

const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

const port = process.env.PORT || 1221;

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './src/index.js',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    chunkFilename: '[name].js',
    publicPath: '/'
  },
  stats: {
    cached: false
  },
  devServer: {
    contentBase: './dist',
    open: true,
    port,
    historyApiFallback: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),

    new BundleAnalyzerPlugin(),
  ],
  resolve: {
    alias: {
      components: path.resolve(path.join(__dirname, 'src', 'components')),
      images: path.resolve(path.join(__dirname, 'src', 'assets', 'images')),
      styles: path.resolve(path.join(__dirname, 'src', 'assets', 'styles')),
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
          'css-loader',
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
  // optimization
  optimization: {
    splitChunks: {
      cacheGroups: {
        default: false,
        vendors: false,
        // vendor chunk
        vendor: {
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