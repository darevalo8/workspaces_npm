const webpack = require('webpack')
const path = require('path')
const glob = require('glob')

const PATHS = {
  src: path.join(__dirname, 'src'),
}

const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const PurgecssPlugin = require('purgecss-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Dotenv = require('dotenv-webpack')

// Disable React DevTools in production
const disableReactDevtools = `
<script>
if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
   __REACT_DEVTOOLS_GLOBAL_HOOK__.inject = function() {};
}
</script>
`

module.exports = {
  /**
   * Mode
   *
   * Use development optimizations.
   */
  mode: 'production',
  optimization: {
    minimizer: [new CssMinimizerPlugin(), '...'],
    runtimeChunk: 'multiple',
    splitChunks: {
      // Cache vendors since this code won't change very often
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/](react|react-dom|axios|redux|react-redux)[\\/]/,
          name: 'vendors',
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
  entry: ['./src/index.tsx'],
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].[hash].bundle.js',
    publicPath: '/',
  },
  devtool: false,
  resolve: {
    // Resolve in this order
    extensions: ['*', '.js', '.jsx', '.ts', '.tsx', '.md'],
    // Allow `@/` to map to `./src/`
    alias: {
      '@': path.resolve(__dirname, './src/'),
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
      chunkFilename: '[id].[hash].css',
      ignoreOrder: false,
    }),
    new PurgecssPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
    }),
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
    new HtmlWebpackPlugin({
      template: './static/template.html',
      hash: true,
      disableReactDevtools,
    }),
    new Dotenv({
      path: './.env', // Path to .env file (this is the default)
      safe: false, // load .env.example (defaults to "false" which does not use dotenv-safe)
    }),
  ],
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
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
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          'sass-loader',
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
    writeToDisk: true,
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