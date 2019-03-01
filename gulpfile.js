var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var clean = require('gulp-clean-css');

gulp.task('less', function () {
    return gulp.src('less/**/*.less')
        .pipe(less())
        .pipe(gulp.dest('css'))
});
gulp.task('concat', ['less'], function () {
    return gulp.src('css/**/*.css')
        .pipe(concat('main.css'))
        .pipe(gulp.dest('dist'))
});
gulp.task('default', ['concat'])