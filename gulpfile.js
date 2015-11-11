/*!
 *  
 * https://www.recmh.com
 *
 * Copyright 2015-2020 fafer
 * Released under the MIT license
 */

'use strict';

var gulp = require('gulp'),
    jade = require('gulp-jade'),
    del = require('del'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    jscs = require('gulp-jscs'),
    jshint = require('gulp-jshint'),
    less = require('gulp-less'),
    imagemin = require('gulp-imagemin'),
    cssmin = require('gulp-minify-css'),
    pngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'),
    react = require('gulp-react'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify');
gulp.task('clean', function(cb) {
    del(['build/view', 'build/js'], cb);
});

gulp.task('react', function () {
    return gulp.src('js/**/*.jsx')
        .pipe(react())
        .pipe(gulp.dest('build/js'));
});

gulp.task('uglify', function() {
    gulp.src('js/**/*.js')
        .pipe(jshint.reporter('default'))
        .pipe(jscs())
        .pipe(concat('main.js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('build/js'))
        .pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('less', function () {
    return gulp.src('./less/**/*.less')
        .pipe(less())
        .pipe(cssmin({compatibility: 'ie8'}))
        .pipe(gulp.dest('./build/css'));
});

gulp.task('jade', function() {
    gulp.src('view/**/*.jade')
        .pipe(gulp.dest('build/view'));
});

gulp.task('img', function() {
    gulp.src('img/**/*.png')
        .pipe(cache(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('build/img'));
});


gulp.watch('less/**/*.less', ['less']).on('change',function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
});

gulp.watch('js/**/*.jsx', ['react']).on('change',function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
});

gulp.task('default',['clean','react','jade','less','img'],function() {

});






