var gulp  = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifyCSS = require('gulp-clean-css'),
    concat = require('gulp-concat');

gulp.task('css', function() {
    return gulp.src('content/styles/*.scss')
        .pipe(sass())
        .pipe(minifyCSS())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9'))
        .pipe(concat('app.css'))
        .pipe(gulp.dest('content/styles'));
});
