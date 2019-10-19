const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const minifyCSS = require('gulp-clean-css');
const concat = require('gulp-concat');

const css = done => {
  return gulp.src('client/content/styles/*.scss')
    .pipe(sass())
    .pipe(minifyCSS())
    .pipe(postcss())
    .pipe(concat('app.css'))
    .pipe(gulp.dest('client/content/styles'));
};

const finish = done => {
  done();
  process.exit(1);
};

module.exports.css = gulp.series(css, finish);
module.exports.default = finish;
