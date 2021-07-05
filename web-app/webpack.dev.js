const webpack = require('webpack')
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Dotenv = require('dotenv-webpack')

module.exports = {
  /**
   * Mode
   *
   * Use development optimizations.
   */
  mode: 'development',
  entry: ['./src/index.tsx'],
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].[hash].bundle.js',
    publicPath: '/',
  },
  // devtool: 'eval',
  resolve: {
    // Resolve in this order
    extensions: ['*', '.js', '.jsx', '.ts', '.tsx', '.md'],
    // Allow `@/` to map to `./src/`
    alias: {
      '@': path.resolve(__dirname, './src/'),
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, './static'),
        to: 'assets',
        // Ignore some files to prevent unnecessary duplication
        ignore: ['*.DS_Store', 'template.html'],
      },
    ]),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: './static/template.html',
      hash: true,
    }),
    new Dotenv({
      path: './.env', // Path to .env file (this is the default)
      safe: false, // load .env.example (defaults to "false" which does not use dotenv-safe)
    }),
  ],

  module: {
    rules: [
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        test: /\.(scss|css)$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { sourceMap: true, importLoaders: 1 },
          },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
    ],
  },
  /**
   * DevServer
   *
   * Spin up a server for quick development.
   */
  devServer: {
    //writeToDisk: true,
    // Necessary for React routing
    historyApiFallback: true,
    // Proxy API in dev mode to different port.
    proxy: {
      '/api': 'http://localhost:8080',
    },
    open: true,
    compress: true,
    hot: true,
    port: 3000,
  },
}