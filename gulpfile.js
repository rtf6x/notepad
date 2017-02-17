var gulp = require('gulp'),
  sass = require('gulp-sass'),
  autoprefixer = require('autoprefixer'),
  postcss = require('gulp-postcss'),
  minifyCSS = require('gulp-clean-css'),
  concat = require('gulp-concat');

gulp.task('css', function () {
  return gulp.src('client/content/styles/*.scss')
    .pipe(sass())
    .pipe(minifyCSS())
    .pipe(postcss([autoprefixer({ add: false, browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9'] })]))
    .pipe(concat('app.css'))
    .pipe(gulp.dest('client/content/styles'));
});

gulp.task('default', ['css']);