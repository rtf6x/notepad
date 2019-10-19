const gulp = require('gulp');
const sass = require('gulp-sass');
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

module.exports.css = css;
module.exports.default = css;
