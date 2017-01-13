var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var sh = require('shelljs');

var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var babelify = require('babelify');
var uglify = require('gulp-uglify');
var glob = require('glob-all');
var header = require('gulp-header');
var fs = require('fs');

/* nicer browserify errors */
var chalk = require('chalk');

var paths = {
  sass: './source/scss/ionic.app.scss',
  sassWatch: './source/scss/**/*.scss',
  app: './source/js/app.js',
  services: './source/js/*Serv.js',
  factories: './source/js/*Fact.js',
  providers: './source/js/*Prov.js',
  directives: './source/js/*Dir.js',
  controllers: './source/js/*Ctrl.js',
  configs: './source/js/*Conf.js',

  js: './source/js/**/*.js'
};

gulp.task('serve:before', ['default']);
gulp.task('serve:after', ['watch']);

gulp.task('default', ['sass', 'babel-js']);

gulp.task('sass', function(done) {
  gulp.src(paths.sass)
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(cleanCSS({
      keepSpecialComments: 0
    }))
    .pipe(rename('style.min.css'))
    .pipe(header(fs.readFileSync('license_header.txt', 'utf8')))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('babel-js', function(done) {
    var testFiles = glob.sync([
      paths.app,
      paths.services,
      paths.factories,
      paths.providers,
      paths.directives,
      paths.configs,
      paths.controllers,
      paths.js
    ]);

    browserify(testFiles, {
    extensions: ['.js'],
    debug: true
  })
    .transform("babelify", {presets: ["es2015"]})
    .bundle()
    .on('error', map_error)
    .pipe(source('app.min.js'))
    //Pour le dev
    .pipe(buffer())
    .pipe(uglify())
    .pipe(header(fs.readFileSync('license_header.txt', 'utf8')))
    .pipe(gulp.dest('./www/js/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sassWatch, ['sass']);
  gulp.watch(paths.js, ['babel-js']);
});


function map_error(err) {
  if (err.fileName) {
    // regular error
    gutil.log(chalk.red(err.name)
      + ': '
      + chalk.yellow(err.fileName.replace(__dirname + '/source/js/', ''))
      + ': '
      + 'Line '
      + chalk.magenta(err.lineNumber)
      + ' & '
      + 'Column '
      + chalk.magenta(err.columnNumber || err.column)
      + ': '
      + chalk.blue(err.description))
  } else {
    // browserify error..
    gutil.log(chalk.red(err.name)
      + ': '
      + chalk.yellow(err.message))
  }

  this.end()
}

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
