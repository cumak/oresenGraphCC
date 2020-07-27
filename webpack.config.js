module.exports = {
  // mode: 'development',
  mode: 'production',
  entry: {
    index:"./resource/js/index.js",//エントリポイント(テスト用)
    oresenGraphCC:"./resource/js/window_ver.js",//scriptタグ読み込み用
  },
  output: {
    // path: __dirname + '/js/',
    filename: "[name].js"
  },
  devServer: {
    contentBase: 'public/',
    historyApiFallback: true,
    port: 3355,
    inline: true,
    hot: true
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                "@babel/preset-env"
              ]
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" }
        ]
      },
      // {
      //   test: /\.(eot|svg|woff|ttf|gif|png)$/,
      //   use: [
      //     { loader: "url-loader" }
      //   ]
      // },
    ]
  },
}
