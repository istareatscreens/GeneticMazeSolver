const gulp = require('gulp');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const sourcemaps = require('gulp-sourcemaps')
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const { src, series, parallel, dest, watch } = require('gulp');
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const run = require('gulp-run');

const output = 'public/lib/';

const jsPath = 'src/js/**/*.js';
const cssPath = 'src/css/**/*.css';
const cppPath = 'src/cpp/**/*.cpp';
const wasmJSPath = 'build/*.js';
const wasmPath = 'public/lib/*.wasm';
const htmlPath = 'src/html/*.html';
const imagePath = 'src/images/*'

function jsTask() {
    return src(jsPath)
        .pipe(sourcemaps.init())
        .pipe(concat('index.js'))
        .pipe(babel({
            presets: ['@babel/env'],

            "plugins": ["@babel/plugin-transform-runtime"],
        }))
        .pipe(terser())
        .pipe(sourcemaps.write('.'))
        .pipe(browserSync.stream())
        .pipe(dest(output));
}


function wasmTask() {
    return src(wasmPath)
        .pipe(browserSync.stream())
        .pipe(dest(output));
}

function wasmJSTask() {
    return src(wasmJSPath)
        .pipe(terser())
        .pipe(sourcemaps.write('.'))
        .pipe(browserSync.stream())
        .pipe(dest(output));
}

function copyHtml() {
    return src(htmlPath).pipe(gulp.dest('public'));
}

function imgTask() {
    return src(imagePath).pipe(imagemin()).pipe(gulp.dest('public/images/'));
}

function cssTask() {
    return src(cssPath)
        .pipe(sourcemaps.init())
        .pipe(concat('style.css'))
        .pipe(postcss([autoprefixer(), cssnano()])) //not all plugins work with postcss only the ones mentioned in their documentation
        .pipe(sourcemaps.write('.'))
        .pipe(browserSync.stream())
        .pipe(dest(output));
}

function watchTask() {
    browserSync.init({
        server: {
            baseDir: './public/'
        }
    });
    gulp.watch([cssPath, jsPath, cppPath, wasmJSPath, htmlPath], { interval: 1000 }, parallel(cssTask, jsTask, wasmTask));
    gulp.watch(htmlPath).on('change', browserSync.reload);
    gulp.watch(jsPath).on('change', browserSync.reload);
    gulp.watch(cssPath).on('change', browserSync.reload);
    gulp.watch(cppPath).on('change', () => run('npm run wasm')); //watch for cpp changes and rebuild
    gulp.watch(wasmJSPath).on('change', browserSync.reload); //wasm js should be detected after build and moved from build folder
}

exports.cssTask = cssTask;
exports.jsTask = jsTask;
exports.default = series(
    parallel(jsTask, cssTask, wasmTask, wasmJSTask, copyHtml, imgTask),
    watchTask
);
exports.watch = watch;