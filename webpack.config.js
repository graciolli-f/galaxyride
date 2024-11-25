const path = require('path');

module.exports = {
  entry: './src/galaxyRide.js',
  output: {
    filename: 'galaxyRide.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'GalaxyRide',
      type: 'umd',
      export: 'default'
    },
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}; 