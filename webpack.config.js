const path = require('path')
const htmlPlugin = require('html-webpack-plugin')
const brotliPlugin = require('brotli-gzip-webpack-plugin')

console.log('Environment set to', process.env.NODE_ENV)

module.exports = {
    mode: process.env.NODE_ENV,
    devtool: process.env.NODE_ENV === 'production' ? '' : 'eval-source-map',
    entry: [
        'babel-polyfill',
        path.join(__dirname, 'src', 'App.js')
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'build.js'
    },
    module: {
        rules: [{
            loader: 'babel-loader',
            test: /\.jsx?$/,
            exclude: /node_modules/,
            query: {
                presets: ['@babel/preset-env', '@babel/preset-react']
            }
        }, {
            test: /\.styl$/,
            exclude: /node_modules/,
            use: ['style-loader', {
                loader: 'css-loader',
                options: {
                    importLoaders: 2
                }
            }, 'stylus-loader'],
            include: /src/
        }, {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        }]
    },
    plugins: [
        new htmlPlugin({
            title: "Payment Gateway",
            template: path.join(__dirname, 'src', 'index.ejs'),
            hash: true
        }),
        new brotliPlugin({
            asset: '[file].br[query]',
            algorithm: 'brotli',
            test: /\.(js|css|html|svg)$/,
            threshold: 10240,
            minRatio: 0.8,
            quality: process.env.NODE_ENV != 'production' ? 0 : 11,
        }),
        new brotliPlugin({
            asset: '[file].gz[query]',
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 10240,
            minRatio: 0.8,
        }),
    ]
}
