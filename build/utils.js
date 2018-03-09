'use strict'
const path = require('path')
const config = require('../config')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const packageConfig = require('../package.json')

const glob = require("glob")

exports.assetsPath = function (_path) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory

  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
  options = options || {}

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader]

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader'
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  const output = []
  const loaders = exports.cssLoaders(options)

  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }

  return output
}

exports.createNotifierCallback = () => {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}

/**
 * 获取入口文件
 * @param {String} globPath 脚本文件的路径
 * @return entries
 */
exports.getEntry = function(globPath) {
	const files = glob.sync(globPath);
	var entries = {};
	var entry, dirName, baseName, pathName, extName, entryName;
	for(let i = 0 ; i < files.length ; ++i) {
		//ex: ./src/scripts/admin/index.js
		entry = files[i];
		
		//ex ./src/scripts/admin
		dirName = path.dirname(entry);
		
		// admin
		entryName = dirName.substring(dirName.lastIndexOf("/") + 1);
		
		extName = path.extname(entry);
		
		baseName = path.basename(entry, extName);
		
		if(undefined !== entries[entryName]) {
			entries[entryName].push(entry);
		}else {
			entries[entryName] = [entry];
		}
	}
	return entries;
}

/**
 * 获取HtmlWebpackPlugin配置
 * @param {String} globPath
 * @return pages
 */
exports.getHtmlWebpackConfig = function(globPath) {
	const files = glob.sync(globPath);
	var pages = [], fileName, baseName, extName, entry, dirName;
	
	for(let i = 0 ; i < files.length ; ++i) {
		entry = files[i];
		
		extName = path.extname(entry);
		
		baseName = path.basename(entry, extName);
		
		dirName = path.dirname(entry);
		
		pages.push({
			filename: dirName.substring(dirName.lastIndexOf("/") + 1) + ".html",
			template: entry,
			inject  : "body",
			chunks: ["manifest", "vendor", dirName.substring(dirName.lastIndexOf("/") + 1)]
		});
	}
	console.log(pages);
	return pages;
}
