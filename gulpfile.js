var gulp         = require('gulp');
var gutil        = require('gulp-util');
var autoprefixer = require('gulp-autoprefixer');
var browserSync  = require('browser-sync').create();
var concat       = require('gulp-concat');
var del          = require('del');
var jshint       = require('gulp-jshint');
var imagemin     = require('gulp-imagemin');
var minifycss    = require('gulp-minify-css');
var notify       = require('gulp-notify');
var rename       = require('gulp-rename');
var responsive   = require('gulp-responsive'); // requires sharp and vips (brew)
var run          = require('gulp-run');
var runSequence  = require('run-sequence');
var sass         = require('gulp-ruby-sass');
var size         = require('gulp-size');
var uglify       = require('gulp-uglify');
var babel        = require("gulp-babel");

var config       = require('./_app/gulp/config');
var paths        = require('./_app/gulp/paths');

// Uses Sass compiler to process styles, adds vendor prefixes, minifies,
// and then outputs file to appropriate location(s)
gulp.task('build:styles', function() {
  return sass(paths.appSassFiles + '/main.scss', {
    style: 'compressed',
    trace: true // outputs better errors
  }).pipe(autoprefixer({browsers: ['last 2 versions', 'ie >= 10']}))
    .pipe(minifycss())
    .pipe(gulp.dest(paths.jekyllDir + 'assets/'))
    .pipe(gulp.dest(paths.siteDir + 'assets/'))
    .pipe(browserSync.stream())
    .on('error', gutil.log);
});

// Creates optimized versions of images,
// then outputs to appropriate location(s)
gulp.task('build:images', function() {
  return gulp.src(paths.appImageFilesGlob)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.jekyllImageFiles))
    .pipe(gulp.dest(paths.siteImageFiles))
    .pipe(browserSync.stream())
    .pipe(size({showFiles: true}))
    .on('error', gutil.log);
})

// Concatenates and uglifies JS files and outputs result to
// the appropriate location(s).
gulp.task('build:scripts', function() {
  return gulp.src(paths.appJsFilesGlob)
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.jekyllDir + 'assets/'))
    .pipe(gulp.dest(paths.siteDir + 'assets/'))
    .on('error', gutil.log);
});

// Runs Jekyll build
gulp.task('build:jekyll', function() {
  var shellCommand = 'bundle exec jekyll build --config _config.yml,_app/localhost_config.yml';
  if (config.drafts) { shellCommand += ' --drafts'; };

  return gulp.src(paths.jekyllDir)
    .pipe(run(shellCommand))
    .on('error', gutil.log);
});

// Builds site
// Optionally pass the --drafts flag to enable including drafts
gulp.task('build', function(cb) {
  runSequence(['build:scripts', 'build:images', 'build:styles'],
              'build:jekyll',
              cb);
});

// Default Task: builds site
gulp.task('default', ['build']);

/* Sass and image file changes can be streamed directly to BrowserSync without
reloading the entire page. Other changes, such as changing JavaScript or
needing to run jekyll build require reloading the page, which BrowserSync
recommends doing by setting up special watch tasks.*/
// Special tasks for building and then reloading BrowserSync
gulp.task('build:jekyll:watch', ['build:jekyll'], function(cb) {
  browserSync.reload();
  cb();
});
gulp.task('build:scripts:watch', ['build:scripts'], function(cb) {
  browserSync.reload();
  cb();
});

// Static Server + watching files
// WARNING: passing anything besides hard-coded literal paths with globs doesn't
//          seem to work with the gulp.watch()
gulp.task('serve', ['build'], function() {

  browserSync.init({
    server: paths.siteDir,
    ghostMode: false, // do not mirror clicks, reloads, etc. (performance optimization)
    logFileChanges: true,
    open: false       // do not open the browser (annoying)
  });

  // Watch site settings
  gulp.watch(['_config.yml', '_app/localhost_config.yml'], ['build:jekyll:watch']);

  // Watch app .scss files, changes are piped to browserSync
  gulp.watch('_app/styles/**/*.scss', ['build:styles']);

  // Watch app .js files
  gulp.watch('_app/scripts/**/*.js', ['build:scripts:watch']);

  // Watch Jekyll posts
  gulp.watch('_posts/**/*.+(md|markdown|MD)', ['build:jekyll:watch']);

  // Watch Jekyll drafts if --drafts flag was passed
  if (config.drafts) {
    gulp.watch('_drafts/*.+(md|markdown|MD)', ['build:jekyll:watch']);
  }

  // Watch Jekyll html files
  gulp.watch(['**/*.html', '!_site/**/*.*'], ['build:jekyll:watch']);

  // Watch Jekyll RSS feed XML file
  gulp.watch('feed.xml', ['build:jekyll:watch']);

  // Watch Jekyll data files
  gulp.watch('_data/**.*+(yml|yaml|csv|json)', ['build:jekyll:watch']);

  // Watch Jekyll favicon.ico
  gulp.watch('favicon.ico', ['build:jekyll:watch']);
});
