/*
 * This config builds a minified version that can be imported
 * anywhere without any dependencies.
 */
const path = require("path");
const webpack = require("webpack");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const SDK_VERSION = require("./package.json").version;

module.exports = {
    entry: {
        http : "./src/http.js",
        logger : "./src/logger.js",
        core: "./src/index.js"
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "@ping-identity/p14c-js-sdk-[name].js",
        libraryTarget: "umd"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                enforce: "pre",
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/env"],
                        plugins: ["@babel/plugin-transform-runtime"],
                        sourceType: "unambiguous"
                    }
                }
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.DefinePlugin({
            SDK_VERSION: JSON.stringify(SDK_VERSION)
        })
    ],
    target: "web",
    node: {
        fs: "empty"
    },
    // Excluding dependencies from the output bundles.
    // Instead, the created bundle relies on that dependency to be present in the consumer's environment
    // externals: ["tls", "net", "fs"],
    devtool: "source-map"
};
