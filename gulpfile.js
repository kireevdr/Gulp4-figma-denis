const { src, dest, parallel, series, watch } = require('gulp')
const del = require('del')
const sass = require('gulp-sass')(require('sass'))
const autoprefixer = require('gulp-autoprefixer')
const gcssmq = require('gulp-group-css-media-queries')
const includeFiles = require('gulp-include')
const browserSync = require('browser-sync').create()
const bulkSass = require('gulp-sass-bulk-import');
const resizer = require('gulp-images-resizer');

function browsersync() {
	browserSync.init({
	  server: {
		baseDir: './public/',
		serveStaticOptions: {
		  extensions: ['html'],
		},
	  },
	  port: 8080,
	  ui: { port: 8081 },
	  open: true,
	})
  }

  function styles() {
	return src('./src/styles/style.scss')
	.pipe(bulkSass())
	.pipe(sass().on('error', sass.logError))
	.pipe(autoprefixer({ grid: true }))
	.pipe(gcssmq())
	.pipe(dest('./public/css/'))
	.pipe(browserSync.stream())
  }

function resize() {
    return src('./src/images/**/*', { encoding: false })
	.pipe(resizer({
            format: 'png',
            width: 1920,
			height: 1080,
			quality: 80,
			tinify: true,
			tinifyKey: 'FTGpCk4WKxVtcnpgWK6JMTtwf1RcmM6T',
        }))
	.pipe(dest('./src/dist/'));
};

  function scripts() {
	return src('./src/js/script.js')
	.pipe(
	  includeFiles({
		includePaths: './src/components/**/',
	  })
	)
	.pipe(dest('./public/js/'))
	.pipe(browserSync.stream())
  }
  
  function pages() {
	return src('./src/pages/*.html')
	.pipe(
	  includeFiles({
		includePaths: './src/components/**/',
	  })
	)
	.pipe(dest('./public/'))
	.pipe(browserSync.reload({ stream: true, }))
  }
  
  function copyFonts() {
	return src('./src/fonts/**/*')
	.pipe(dest('./public/fonts/'))
  }
  
  function copyImages() {
	return src('./src/dist/**/*', { encoding: false }) 
	.pipe(dest('./public/images/'))
  }

  function copyDist() {
	return src('./src/icons/**/*', { encoding: false }) 
	.pipe(dest('./public/images/'))
  }
  
  async function copyResources() {
	copyFonts()
	copyImages()
	copyDist()
  }

  async function clean() {
	return del.sync('./public/', { force: true })
  }
  
  function watch_dev() {
	watch(['./src/js/script.js', './src/components/**/*.js'], scripts)
	watch(['./src/styles/style.scss', './src/components/**/*.scss'], styles).on(
	  'change',
	  browserSync.reload
	)
	watch(['./src/pages/*.html', './src/components/**/*.html'], pages).on(
	  'change',
	  browserSync.reload
	)
  }
  
exports.browsersync = browsersync
exports.clean = clean
exports.resize = resize
exports.scripts = scripts
exports.styles = styles
exports.pages = pages
exports.copyResources = copyResources

exports.default = parallel(
  clean,
  resize,
  styles,
  scripts,
  copyResources,
  pages,
  browsersync,
  watch_dev
)

exports.build = series(
  clean,
  styles,
  scripts,
  pages,
  copyResources
)

  
  