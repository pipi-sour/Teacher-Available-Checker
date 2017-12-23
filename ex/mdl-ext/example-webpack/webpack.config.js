const path = require('path');
const webpack = require('webpack');
const precss = require('precss');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const argv = require('./server/array-to-key-value').arrayToKeyValue(process.argv.slice(2));
const isDev = process.env.NODE_ENV !== 'production' && !argv['env.prod'];
const isProd = !isDev;
const isHot = argv['hot'] || false;
const src = path.resolve(process.cwd(), 'src');
const dist = path.resolve(process.cwd(), 'dist');
const publicPath = '/';
const context = src;

// get the intended port number, use port 3000 if not provided
const host = 'localhost';
const port = process.env.PORT || argv.port || 3000;

//console.log('Webpack argv:', argv, 'isDev:', isDev, 'isHot:', isHot);

const removeEmptyKeys = obj => {
  const result = {};
  for (const key in obj) {
    if (!(obj[key] == null || obj[key].length === 0)) {
      result[key] = obj[key];
    }
  }
  return result;
};

const devPlugins = isDev ? [
  new HtmlWebpackPlugin({
    template: './index.html',
    inject: true,
    favicon: 'favicon.png',
    // Correct bundle order: [manifest, vendor, app]
    // see: http://stackoverflow.com/questions/36796319/webpack-with-commonschunkplugin-results-with-wrong-bundle-order-in-html-file
    // see: https://github.com/ampedandwired/html-webpack-plugin/issues/481
    chunksSortMode: 'dependency',
    xhtml: true,
  }),
] : [];

const hotPlugins = isHot ? [
  new webpack.HotModuleReplacementPlugin({
    multiStep: true, // Enable multi-pass compilation for enhanced performance in larger projects.
  }),
] : [];

const prodPlugins = isProd ? [
  // Note: do not use '-p' in "build:prod" script

  // Minify and optimize the index.html
  new HtmlWebpackPlugin({
    template: './index.html',
    inject: true,
    favicon: 'favicon.png',
    // Correct bundle order: [manifest, vendor, app]
    // see: http://stackoverflow.com/questions/36796319/webpack-with-commonschunkplugin-results-with-wrong-bundle-order-in-html-file
    // see: https://github.com/ampedandwired/html-webpack-plugin/issues/481
    chunksSortMode: 'dependency',
    xhtml: true,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeStyleLinkTypeAttributes: true,
      keepClosingSlash: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true,
    },
  }),

  // Merge all duplicate modules
  // No longer needed; default in webpack2
  //new webpack.optimize.DedupePlugin(),

  new webpack.LoaderOptionsPlugin({
    minimize: true,
    debug: false,
    quiet: true
  }),

  new webpack.optimize.UglifyJsPlugin({
    compress: {
      unused: true,    // Enables tree shaking
      dead_code: true, // Enables tree shaking
      pure_getters: true,
      warnings: false,
      screw_ie8: true,
      conditionals: true,
      comparisons: true,
      sequences: true,
      evaluate: true,
      if_return: true,
      join_vars: true,
    },
    output: {
      comments: false
    },
    sourceMap: true
  }),
] : [];


const cssRules = isHot ? [
  {
    // Enables HMR. Inlines CSS in html head style tag
    test: /\.css$/,
    include: [
      src,
      path.resolve(process.cwd(), 'node_modules')
    ],
    use: [
      'style-loader',
      // urls does not work when using sourceMap.
      // See: https://github.com/webpack/css-loader/issues/216
      // See: https://github.com/webpack/css-loader/issues/296
      // See: http://stackoverflow.com/questions/37288886/webpack-background-images-not-loading
      'css-loader', // { loader: 'css', query: { sourceMap: true } },
      'postcss-loader',
      'resolve-url-loader',
    ]
  },
  {
    // Enables HMR. Inlines SASS in html head
    test: /\.s?(a|c)ss$/,
    include: [
      src,
      path.resolve(process.cwd(), 'node_modules')
    ],
    use: [
      'style-loader',
      'css-loader', // { loader: 'css', query: { sourceMap: true } }, // urls does not work when using sourceMap, see: comments above
      'postcss-loader',
      'resolve-url-loader',
      { loader: 'sass-loader', query: { sourceMap: isProd ? 'compressed' : 'expanded' } },
    ]
  },
] : [
  {
    // No HMR. Creates external CSS
    test: /\.css$/,
    include: [
      src,
      path.resolve(process.cwd(), 'node_modules')
    ],
    loader: ExtractTextPlugin.extract({
      fallbackLoader: 'style-loader',
      loader: ['css-loader?sourceMap', 'postcss-loader', 'resolve-url-loader']
    })
  },
  {
    // No HMR. Creates external CSS
    test: /\.s?(a|c)ss$/,
    include: [
      src,
      path.resolve(process.cwd(), 'node_modules')
    ],
    loader: ExtractTextPlugin.extract({
      fallbackLoader: 'style-loader',
      loader: [
        {
          loader: 'css-loader', query: { sourceMap: true }
        },
        'postcss-loader',
        'resolve-url-loader',
        {
          loader: 'sass-loader', query: { sourceMap: isProd ? 'compressed' : 'expanded' }
        }
      ]
    })
  }
];

module.exports = {
  context: src,

  // Developer tool to enhance debugging, source maps
  // see: http://webpack.github.io/docs/configuration.html#devtool
  devtool: isProd ? 'source-map' : 'cheap-module-source-map',
  cache:   !isProd,
  bail:    isProd,  // Don't attempt to continue if there are any errors.
  target:  'web',   // Make web variables accessible to webpack, e.g. window. This is a default value; just be aware of it
  resolve: {
    modules: [
      'src',
      'node_modules',
    ],
    extensions: ['.js', '.jsx', '.json', '.css', '.sass', '.scss', '.html']
  },
  entry: removeEmptyKeys({
    app: (isHot ? [
      // Dynamically set the webpack public path at runtime below
      // Must be first entry to properly set public path
      // See: http://webpack.github.io/docs/configuration.html#output-publicpath
      './webpack-public-path.js',

      // reload - Set to true to auto-reload the page when webpack gets stuck. (React: use reload=false)
      // See: https://github.com/glenjamin/webpack-hot-middleware
      'webpack-hot-middleware/client?reload=true',

      // Webpack2: remove any reference to webpack/hot/dev-server or webpack/hot/only-dev-server
      // from your webpack config. Instead, use the reload config option of 'webpack-hot-middleware'.
      // See: https://github.com/glenjamin/webpack-hot-middleware#200
      //'webpack/hot/only-dev-server',

    ] : [] ).concat([
      './index.js',
      './styles.scss',
    ]),
  }),
  output: {
    filename: isProd ? '[name].[chunkhash].js' : '[name].js', // Don't use hashes in dev mode
    chunkFilename: isProd ? '[name].[chunkhash].chunk.js' : '[name].chunk.js',
    path: dist,
    publicPath: publicPath,
    pathinfo: !isProd,
  },
  performance: {
    hints: isProd ? 'warning' : false,
  },
  module: {
    rules: [
      {
        test: /\.js[x]?$/,
        enforce: 'pre',
        loader: 'eslint-loader',
        include: [src],
        exclude: [/node_modules/],
      },
      {
        test: /\.js[x]?$/,
        include: [src],
        exclude: [/node_modules/],
        loader: 'babel-loader',
      },
      {
        // Enables HMR. Extra step is needed in './src/index.js'
        test: /\.html$/,
        loader: 'html-loader', // loader: 'html', // loader: 'raw' // html vs raw: what's the difference??
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.(jpg|jpeg)$/,
        loader: 'url-loader?name=[name].[ext]&limit=8192&mimetype=image/jpg'
      },
      {
        test: /\.gif$/,
        loader: 'url-loader?name=[name].[ext]&limit=8192&mimetype=image/gif'
      },
      {
        test: /\.png$/,
        use: 'url-loader?name=[name].[ext]&limit=8192&mimetype=image/png'
      },
      {
        test: /\.svg$/,
        loader: 'url-loader?name=[name].[ext]&limit=8192&mimetype=image/svg+xml'
      },
      {
        test: /\.woff?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: ['url-loader?name=[name].[ext]&limit=100000&mimetype=application/font-woff']
      },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: ['url-loader?name=[name].[ext]&limit=100000&mimetype=application/font-woff2']
      },
      {
        test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: ['file-loader?name=[name].[ext]&limit=100000&mimetype=application/octet-stream']
      },
      {
        test: /\.otf(\?.*)?$/,
        loader: 'file-loader?name=[name].[ext]&limit=10000&mimetype=font/opentype'
      },
    ].concat(cssRules)
  },
  plugins: [
    // Always expose NODE_ENV to webpack, in order to use `process.env.NODE_ENV`
    // inside your code for any environment checks; UglifyJS will automatically
    // drop any unreachable code.
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': isProd ? JSON.stringify('production') : JSON.stringify('development'),
      __DEV__: !isProd
    }),

    new webpack.LoaderOptionsPlugin({
      // See: https://github.com/postcss/postcss-loader/issues/125
      // See: http://pastebin.com/Lmka3rju
      minimize: isProd,
      debug: !isProd,
      stats: {
        colors: true
      },
      options: {
        context: src,
        output: {
          path: dist,
        },
        postcss: [
          precss,
          autoprefixer({
            browsers: [
              'last 2 versions',
              'ie >= 11',
            ],
          }),
        ],
      },
      eslint: {
        failOnWarning: false,
        failOnError: true
      },
    }),

    // Avoid publishing files when compilation fails
    new webpack.NoEmitOnErrorsPlugin(),

    // No longer needed in Webpack2, on by default
    //new webpack.optimize.OccurrenceOrderPlugin(),

    // Generate an external css file with a hash in the filename
    new ExtractTextPlugin({
      filename: isProd ? '[name].[chunkhash].styles.css' : '[name].styles.css',
      disable: false,
      allChunks: true
    }),

    new StyleLintPlugin({
      // https://github.com/vieron/stylelint-webpack-plugin
      // http://stylelint.io/user-guide/example-config/
      configFile: '.stylelintrc',
      context: 'src',
      files: '**/*.s?(a|c)ss',
      syntax: 'scss',
      failOnError: false
    }),

    // Module ids are full names
    // Outputs more readable module names in the browser console on HMR updates
    new webpack.NamedModulesPlugin(),

    // CommonsChunk analyzes everything in your bundles, extracts common bits into files together.
    // See: https://webpack.js.org/guides/code-splitting-libraries/
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
    }),

  ].concat(devPlugins).concat(hotPlugins).concat(prodPlugins),

  // Config options:
  // see: https://webpack.github.io/docs/webpack-dev-server.html
  // see: https://webpack.js.org/configuration/dev-server/
  // see: https://github.com/webpack/webpack-dev-middleware
  // see: https://github.com/chimurai/http-proxy-middleware
  // see: https://github.com/bripkens/connect-history-api-fallback
  // NOTE: Only use options that are compatible with webpack-dev-middleware
  devServer: {
    host: host,
    port: port,
    publicPath: publicPath,
    contentBase: context,   // contentBase: `http://${host}:${port}`,
    hot: isHot,
    compress: true,
    open: true,
    noInfo: true,
    stats: 'errors-only',
    inline: true,
    lazy: false,
    headers: {'Access-Control-Allow-Origin': '*'},
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    },
    historyApiFallback: {
      verbose: true
    },
  }
};
