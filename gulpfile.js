var gulp = require('gulp'),
	browserSync  = require('browser-sync'),
	imagemin = require('gulp-imagemin'),
	svgmin = require('gulp-svgmin'),
	svgstore = require('gulp-svgstore'),
	path = require('path'),
	htmlmin = require('gulp-html-minifier'),
	concat = require('gulp-concat'),
	minifyCSS = require('gulp-clean-css'),
	uglify  = require('gulp-uglify'),
	gulpif = require('gulp-if'),
	jshint = require("gulp-jshint"),
	plumber = require("gulp-plumber"),
	notify = require("gulp-notify"),
	mainBowerFiles = require('main-bower-files'),
	rename = require("gulp-rename"),
	less = require('gulp-less'),
	uncss = require('gulp-uncss'),
	fileinclude = require('gulp-file-include'),
	csscomb = require('gulp-csscomb'),
	sourcemaps = require('gulp-sourcemaps'),
	spritesmith = require('gulp.spritesmith'),
	cheerio = require('gulp-cheerio'),
  modernizr = require('gulp-modernizr'),
  pug = require('gulp-pug'),
  sass = require('gulp-sass'),
  del  = require('del'),
  svgSprite = require('gulp-svg-sprite'),
  autoprefixer = require('gulp-autoprefixer'),
	argv = require('yargs').argv;

var config = {
  server: {
    baseDir: 'prod'
  },
  tunnel: false,
  host: 'localhost',
  port: 3000,
  logPrefix: "Webxieter prod.",
  browser: "chrome"
};

gulp.task ('browserSync', function(){
  browserSync(config)
});

gulp.task('images', function() {
	return gulp.src('dev/images/*.*')
  .pipe(imagemin())
	.pipe(gulp.dest('prod/images'))
	.pipe(browserSync.reload({stream: true}))
});

gulp.task('favicons', function() {
  return gulp.src('dev/images/favicons/*.*')
  .pipe(imagemin())
  .pipe(gulp.dest('prod/images/favicons/'))
  .pipe(browserSync.reload({stream: true}))
});


gulp.task('sprite', function() {
	var spriteData =
		gulp.src('dev/images/sprites/*.png')
			.pipe(spritesmith({
				imgName: 'sprite.png',
				cssName: 'sprite.scss'
			}));
	spriteData.img.pipe(gulp.dest('prod/images/'));
	spriteData.css.pipe(gulp.dest('dev/style/'));
});

gulp.task('svg-sprite', function() {
  return gulp.src('dev/images/sprites/*.svg')
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    // .pipe(cheerio({
      //run: function ($) {
        // $('[fill]').removeAttr('fill');
        // $('[stroke]').removeAttr('stroke');
        // $('[style]').removeAttr('style');
      //},
      // parserOptions: { xmlMode: true }
    // }))
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: '../SVG.svg'
        }
      }
    }))
    .pipe(gulp.dest('prod/images/'));
  })

gulp.task('fonts', function() {
	return gulp.src('dev/fonts/**/*')
	.pipe(gulp.dest('prod/fonts'))
	.pipe(browserSync.reload({stream: true}))
});


gulp.task('view', function() {
  return gulp.src('dev/view/index.pug')
    .pipe(pug({
      pretty: true
    }))
    .on('error', notify.onError(function(error) {
      return {
        title: 'Pug',
        message:  error.message
      }
     }))
    .pipe(gulpif(argv.production, htmlmin({collapseWhitespace: true, removeComments: true})))
    .pipe(gulp.dest('prod/'))
    .pipe(browserSync.reload({stream: true}))
});

gulp.task('sass', function() {
  return gulp.src('dev/style/style.sass')
  	.pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: 'dev/style/**/*.sass',
      outputStyle: 'expanded'
    })).on('error', sass.logError)
    .pipe(autoprefixer({browsers: ['last 5 versions']}))
    .pipe(gulpif(argv.production, minifyCSS()))
    // .pipe(gulpif(argv.production, rename({suffix: '.min'})))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('prod/css/'))
    .pipe(browserSync.reload({stream: true}))
});


gulp.task('bowercss', function(){
	return gulp.src(mainBowerFiles({base: 'bower_components', filter: '**/*.css'}))
		 .pipe(sourcemaps.init())
//		 .pipe(uncss({html: ['dev/view/*.html']}))
		 .pipe(concat('vendor.css'))
		 .pipe(gulpif(argv.production, minifyCSS()))
		 // .pipe(gulpif(argv.production, rename({suffix: '.min'})))
		 .pipe(sourcemaps.write('.'))
		 .pipe(gulp.dest('prod/css'))
		 .pipe(browserSync.reload({stream: true}))
});

gulp.task('bowerjs', function(){
	return gulp.src(mainBowerFiles({base: 'bower_components', filter: '**/*.js'}))
		 .pipe(sourcemaps.init())
		 .pipe(concat('vendor.js'))
		 .pipe(gulpif(argv.production, uglify()))
		 // .pipe(gulpif(argv.production, rename({suffix: '.min'})))
		 .pipe(sourcemaps.write('.'))
		 .pipe(gulp.dest('prod/scripts'))
		 .pipe(browserSync.reload({stream: true}))
});


gulp.task('scripts', function () {
	return gulp.src(['dev/scripts/*.js', '!dev/scripts/modernizr-custom.js'])
     .pipe(sourcemaps.init())
		 .pipe(gulpif(argv.production, uglify()))
		 .pipe(sourcemaps.write('.'))
		 .pipe(gulp.dest('prod/scripts'))
		 .pipe(browserSync.reload({stream: true}))
});


gulp.task('jshint', function() {
    return gulp.src('dev/scripts/myscripts.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default')); //стилизуем вывод ошибок в консоль
});

gulp.task('modernizr', function() {
  var settings = require('./node_modules/modernizr/lib/config-all.json');
   gulp.src('./js/*.js')
  .pipe(modernizr('modernizr.js', settings))
   .pipe(rename({suffix: '.min'}))
   .pipe(gulp.dest("prod/scripts/"))
});

gulp.task ('watch', function(){
	gulp.watch('dev/view/**/*.pug', ['view']);
	gulp.watch('dev/style/**/*.sass', ['sass']);
	gulp.watch('dev/scripts/*.js', ['scripts']);
	// gulp.watch('bower_components/**/*', ['bowerjs'], ['bowercss']);
});

gulp.task ('default', ['view', 'bowerjs', 'bowercss', 'scripts', 'sass', 'browserSync', 'watch', 'jshint']);
gulp.task ('build', ['view', 'scripts', 'images', 'favicons', 'fonts', 'bowerjs', 'bowercss', 'sass', 'sprite', 'svg-sprite']);
gulp.task('del', function() {return del.sync('prod'); });

