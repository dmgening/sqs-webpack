require('dotenv').config({silent: true})

const path = require('path'),
      glob = require('glob'),
      webpack = require('webpack'),
      CleanPlugin = require('clean-webpack-plugin'),
      ExtractTextPlugin = require('extract-text-webpack-plugin'),
      CopyWebpackPlugin = require('copy-webpack-plugin')


const isProduction = process.env.NODE_ENV === 'production',
      package = {
          root: __dirname,
          build: path.resolve(__dirname, 'build'),
          src: path.resolve(__dirname, 'src'),
          json: require(path.resolve(__dirname, 'package.json'))
      }

const rules = [{
    exclude: /node_modules/,
    oneOf: [{
        test: /\.conf$/,
        loader: `file-loader?context=${package.src}&name=[path][name].[ext]`
    },{
        exclude: /\.conf$'/,
        include: ['regions', 'blocks',
                  'pages', 'collections'].map(d => path.resolve(package.src, d)),
        use: [{loader: "file-loader",
               options: { context: package.src,
                          name (file) {
                              if (/\/regions\//.test(file)) return "[name].[ext]"
                              return "[path][name].[ext]"
                          }}
              },{
                  loader: "extract-loader"
              },{
                  loader: "html-loader",
                  options: { minimize: isProduction,
                             iterpolate: true }
              }]
    },{
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
            presets: [ '@babel/preset-env' ]
        }
    },{
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
                { loader: 'css-loader',
                  options: { sourceMap: !isProduction }},
                { loader: 'less-loader',
                  options: { sourceMap: !isProduction }},
            ]
        })
    },{
        loader: "file-loader",
        options: {
            name: `assets/${isProduction ? '[hash]' : '[name].[hash:8]'}.[ext]`
        }
    }]
}]

module.exports = {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'source-map',
    module: {rules},
    entry: {
        app: path.resolve(package.src, 'index.js')
    },
    output: {
        filename: 'scripts/[id].[chunkhash:8].js',
        path: package.build,
        publicPath: '/'
    },
    plugins: [
        new CleanPlugin([package.build], {exclude: ".git"}),
        new ExtractTextPlugin({
            filename: 'styles/[id].[chunkhash:8].css',
            allChunks: true
        }),
    ],
    optimization: {
        splitChunks: {
            chunks: 'all',
            automaticNameDelimiter: '.',
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                }
            }
        }
    }
}
