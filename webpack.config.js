const path = require('path');

const vtkRules = require('@kitware/vtk.js/Utilities/config/dependency.js').webpack.core.rules;
const cssRules = require('@kitware/vtk.js/Utilities/config/dependency.js').webpack.css.rules;

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    app: path.join(__dirname, 'src', 'scene.js'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ].concat(vtkRules, cssRules),
  },
  resolve: {
    extensions: ['.js'],
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    disableHostCheck: true,
    hot: false,
    quiet: false,
    noInfo: false,
    stats: {
      colors: true,
    },
  },
  plugins: [
    new HtmlWebpackPlugin()
  ],
};

