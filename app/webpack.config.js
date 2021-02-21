const HtmlWebpackPlugin = require('html-webpack-plugin');
const NodePolyfillWebpackPlugin = require('node-polyfill-webpack-plugin');
const { join } = require('path');

module.exports = {
    mode: 'development',
    target: 'web',
    entry: join(__dirname, 'src/index.tsx'),
    output: {
        filename: '[name].js',
        path: join(__dirname, 'dist'),
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: [/node_modules/],
                use: {
                    loader: 'ts-loader'
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: join(__dirname, 'src/index.ejs')
        }),
        new NodePolyfillWebpackPlugin()
    ],
    resolve: {
        extensions: ['.js', '.json', 'ts', '.tsx']
    },
    devServer: {
        historyApiFallback: true,
        port: 8080,
        publicPath: '/'
    }
}