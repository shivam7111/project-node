const path = require('path')
const nodeExternals = require('webpack-node-externals')
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin
const CopyPlugin = require('copy-webpack-plugin')
var ZipPlugin = require('zip-webpack-plugin')

const distDir = 'dist'

module.exports = {
  target: "node",
  entry: {
    app: ["./app.js"]
  },
  output: {
    path: path.resolve(__dirname, distDir),
    filename: "student-admission-app.js"
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin([
      { from: 'node_modules', to: 'node_modules' },
      { from: 'public', to: 'public' },
      // { from: '.env', to: '.env' },
      // { from: 'a1.html', to: 'a1.html' }
    ]),
    new ZipPlugin({
      filename: 'student-admission-app-build.zip',

      fileOptions: {
        mtime: new Date(),
        mode: 0o100664,
        compress: true,
        forceZip64Format: false,
      },
      zipOptions: {
        forceZip64Format: false,
      },
    })
  ],
  externals: [nodeExternals()]
}