const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');

module.exports = (env, argv, dir = __dirname) => {
    const customEnv = {};

    dotenv.config({
        path: path.resolve(__dirname, '../.env'),
        processEnv: customEnv
    });

    dotenv.config({
        path: path.resolve(dir, '../.env'),
        processEnv: customEnv,
        override: true
    });

    //** Iterate through customEnv and append each object key with process.env. */
    const replacementObject = {};

    Object.keys(customEnv).forEach(key => {
        replacementObject[`process.env.${key}`] = JSON.stringify(customEnv[key]);
    });

    return merge(common(env, argv, dir), {
        mode: 'development',
        watchOptions: {
            ignored: /node_modules([\\/]+|\/)+/
        },
        plugins: [new webpack.DefinePlugin(replacementObject)],
        devServer: {
            devMiddleware: {
                writeToDisk: true
            }
        },
        cache: false
    });
};
