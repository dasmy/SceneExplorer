const path = require('path');

const vtkRules = require('@kitware/vtk.js/Utilities/config/dependency.js').webpack.core.rules;
const cssRules = require('@kitware/vtk.js/Utilities/config/dependency.js').webpack.css.rules;

const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');

module.exports = {
  entry: {
    app: path.join(__dirname, 'src', 'scene.js'),
  },
  output: {
    publicPath: '',
    path: path.join(__dirname, 'dist'),
    filename: 'SceneExplorer.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/,
        type: "asset/inline",
        // Inline assets with the "inline" query parameter.
        resourceQuery: /inline/,
      }
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
    new HtmlWebpackPlugin({
      title: 'SceneExplorer',
      filename: 'SceneExplorer.html',
    }),
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/SceneExplorer/]),
  ],
};

