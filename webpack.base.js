// @ts-check
const HtmlWebpackPlugin = require('html-webpack-plugin')
// const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const { LinkFilePlugin } = require('link-file-plugin')
const path = require('path')
const { DefinePlugin } = require('webpack')
const chalk = require('chalk')
// const webpack = require('webpack')

const version = require('./packages/gallop/package.json').version.replace(
  /^\^/,
  ''
)

// const instrumentsPath = path.resolve(__dirname, './instruments')

/**
 * @param {string} dir
 * @returns {() => import('webpack').Configuration}
 */
// @ts-ignore
const config = (dir) => (env, args) => {
  const __prod__ = args.mode === 'production'

  console.log(`=== args ===`)
  for (const key in args) {
    console.log(chalk.yellowBright(`${key}: ${JSON.stringify(args[key])}`))
  }
  console.log(
    `=== production : ${
      __prod__ ? chalk.green(__prod__) : chalk.red(__prod__)
    } ===`
  )

  console.log(chalk.greenBright(`Gallop version: ${version}`))

  console.log(chalk.underline(dir))

  return {
    mode: args.mode,

    entry: {
      main: path.resolve(dir, './src/App.ts')
    },
    output: {
      filename: 'js/[name].js',
      path: path.resolve(dir, './dist'),
      libraryTarget: 'umd',
      chunkFilename: '[name].js?[contenthash]'
    },

    // watch: true,
    // watchOptions: {
    //   poll: 1000,
    //   aggregateTimeout: 500,
    //   ignored: /node_modules/,
    // },
    resolve: {
      extensions: ['.ts', '.js', '.scss', 'css'],
      alias: {
        '@doc': path.resolve(__dirname, 'packages/doc/src')
      }
    },
    optimization: {
      minimize: __prod__,
      minimizer: [
        new TerserPlugin({
          test: /\.js(\?.*)?$/i
        })
      ]
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                compilerOptions: {
                  declaration: false
                }
              }
            }
          ],
          exclude: /node_modules/
        },
        {
          test: /\.((s[ac])|c)ss$/,
          oneOf: [
            {
              resourceQuery: /url/,
              rules: [
                {
                  loader: 'file-loader',
                  options: {
                    name: 'css/[contenthash:10].css'
                  }
                },
                { loader: 'extract-loader' },
                { loader: '2string-loader' },
                { loader: 'css-loader' },
                {
                  loader: 'postcss-loader',
                  options: {
                    postcssOptions: {
                      plugins: [['postcss-preset-env', {}]]
                    }
                  }
                },
                { loader: 'sass-loader' }
              ]
            },
            {
              resourceQuery: /raw/,
              rules: [
                { loader: '2string-loader' },
                { loader: 'css-loader', options: { sourceMap: false } },
                {
                  loader: 'postcss-loader',
                  options: {
                    postcssOptions: {
                      plugins: [['postcss-preset-env', {}]]
                    }
                  }
                },
                { loader: 'sass-loader' }
              ]
            },
            {
              resourceQuery: /link/,
              rules: [
                {
                  loader: LinkFilePlugin.loader,
                  options: { rels: ['preload'], as: 'style', slient: false }
                },
                {
                  loader: 'file-loader',
                  options: {
                    name: 'css/[contenthash:10].css'
                  }
                },
                { loader: 'extract-loader' },
                { loader: '2string-loader' },
                { loader: 'css-loader', options: { sourceMap: false } },
                {
                  loader: 'postcss-loader',
                  options: {
                    postcssOptions: {
                      plugins: [['postcss-preset-env', {}]]
                    }
                  }
                },
                { loader: 'sass-loader' }
              ]
            },
            {
              rules: [
                // {
                //   loader: LinkFilePlugin.loader,
                //   options: { rels: ['stylesheet'], slient: false }
                // },
                // {
                //   loader: 'file-loader',
                //   options: {
                //     name: 'css/[contenthash:10].css'
                //   }
                // },
                // { loader: 'extract-loader' },
                // { loader: '2string-loader' },
                { loader: MiniCssExtractPlugin.loader },
                { loader: 'css-loader' },
                {
                  loader: 'postcss-loader',
                  options: {
                    postcssOptions: {
                      plugins: [['postcss-preset-env', {}]]
                    }
                  }
                },
                { loader: 'sass-loader' }
              ]
            }
          ]
        },
        {
          test: /\.(ico|woff|ttf)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                outputPath: '/assets/',
                name: '[name].[ext]'
              }
            }
          ]
        },
        {
          test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                // publicPath: '',
                limit: 4096,
                fallback: {
                  loader: 'file-loader',
                  options: {
                    outputPath: '/assets/',
                    name: 'img/[name].[hash:8].[ext]'
                  }
                }
              }
            }
          ]
        },
        {
          test: /\.md$/,
          use: 'raw-loader'
        }
      ]
    },
    devtool: __prod__ ? false : 'inline-source-map',
    // devtool: false,
    devServer: {
      contentBase: './dist',
      open: false,
      stats: 'errors-only',
      host: '0.0.0.0',
      compress: true,
      useLocalIp: true,
      watchOptions: {
        ignored: /__tests__/
      },
      hot: true
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanAfterEveryBuildPatterns: ['./dist']
      }),
      new HtmlWebpackPlugin({
        template: './public/index.ejs',
        inject: true,
        filename: 'index.html',
        chunks: ['main'],
        // favicon: './public/favicon.ico',
        minify: {
          collapseWhitespace: __prod__,
          removeComments: true
        },
        hash: true,
        templateParameters: {
          env: JSON.stringify(env),
          gallopCdn: __prod__
            ? `<script src="https://unpkg.com/@gallop/gallop@${version}/dist/index.umd.js"></script>`
            : ''
        }
      }),
      // new ScriptExtHtmlWebpackPlugin({}),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(dir, 'public'),
            to: path.resolve(dir, 'dist'),
            toType: 'dir',
            globOptions: {
              ignore: ['**/index.ejs']
            }
          }
        ]
      }),
      new DefinePlugin({
        __prod__
      }),
      new MiniCssExtractPlugin({
        filename: 'css/[name].css'
      }),
      new LinkFilePlugin()
      // new CompressionPlugin({
      //   include: /\.js$/,
      //   filename: '[path].gz',
      // })
    ]
  }
}

module.exports = config
