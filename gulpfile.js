var gulp = require('gulp');
var shell = require('gulp-shell');
var clean = require('gulp-clean');
var htmlreplace = require('gulp-html-replace');
var runSequence = require('run-sequence');
var Builder = require('systemjs-builder');
var builder = new Builder('', 'systemjs.config.js');

var bundleHash = new Date().getTime();
var mainBundleName = bundleHash + '.main.bundle.js';
var vendorBundleName = bundleHash + '.vendor.bundle.js';

    /* CSS */
var postcss = require('gulp-postcss'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('autoprefixer'),
    precss = require('precss'),
    cssnano = require('cssnano'),
    minify  = require('gulp-minify-css'),

    /* Misc. */
    ext_replace = require('gulp-ext-replace'),
    concat = require('gulp-concat'),
    es = require('event-stream')

;

// This is main task for production use
gulp.task('dist', function(done) {
    runSequence('clean', 'compile_ts', 'bundle', function() {
        done();
    });
});

gulp.task('bundle', ['bundle:vendor', 'bundle:app', 'bundle:css'], function () {
    return gulp.src('dev/client/index.html')
        .pipe(htmlreplace({
            'app': mainBundleName,
            'vendor': vendorBundleName
        }))
        .pipe(gulp.dest('./public/dist'));
});

gulp.task('bundle:vendor', function () {
    return builder
        .buildStatic('dev/client/app/vendor.js', './public/dist/' + vendorBundleName)
        .catch(function (err) {
            console.log('Vendor bundle error');
            console.log(err);
        });
});

gulp.task('bundle:app', function () {
    return builder
        .buildStatic('dev/client/app/main.js', './public/dist/' + mainBundleName)
        .catch(function (err) {
            console.log('App bundle error');
            console.log(err);
        });
});

gulp.task('compile_ts', ['clean:ts'], shell.task([
    'tsc'
]));

gulp.task('build:css', function() {
    return gulp.src('./dev/client/assets/**/*')
    .pipe(sourcemaps.init())
    .pipe(postcss([precss, autoprefixer, cssnano]))
    .pipe(sourcemaps.write())
    .pipe(ext_replace('.css'))
    .pipe(gulp.dest('./public/dist/assets'));
});

gulp.task('bundle:css', ['build:css'], function() {
    return gulp.src(['./public/dist/assets/**/*', './public/dist/assets/!styles{.min}.css'])
        .pipe(concat('styles.min.css'))
        .pipe(minify())
        .pipe(gulp.dest('./public/dist/assets'));
});

gulp.task('clean', ['clean:ts', 'clean:dist']);

gulp.task('clean:dist', function () {
    return gulp.src(['./public/dist'], {read: false})
        .pipe(clean());
});

gulp.task('clean:ts', function () {
    return gulp.src(['./dev/client/app/**/*.js', './dev/client/app/**/*.js.map'], {read: false})
        .pipe(clean());
});
