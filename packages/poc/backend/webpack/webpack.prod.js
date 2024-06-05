const merge = require('webpack-merge');
const common = require('./webpack.common.js');


module.exports = (env, argv, dir = __dirname) =>
    merge(common(env, argv, dir), {
        mode: 'production',
        optimization: {
            minimize: false
        }
    });

