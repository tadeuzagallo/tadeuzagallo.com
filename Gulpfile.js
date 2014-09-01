// jshint strict:false

var _ = require('lodash');
var express = require('express');
var fs = require('fs');
var gulp = require('gulp');
var lr = require('tiny-lr');

var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var exec = require('gulp-exec');
var gulpif = require('gulp-if');
var gzip = require('gulp-gzip');
var haml = require('gulp-haml');
var imagemin = require('gulp-imagemin');
var jshint = require('gulp-jshint');
var refresh = require('gulp-livereload');
var uglify = require('gulp-uglify');
var stylus = require('gulp-stylus');

var server = lr();
var config = _.extend({
  port: 8080,
  lrport: 35729,
  env: 'development'
}, gulp.env);
console.log(config);
var production = config.env === 'production' || config._.indexOf('deploy') !== -1;

gulp.task('resume', function () {
  return gulp
    .src('src/resume.pdf')
    .pipe(gulp.dest('out'));
});


gulp.task('jshint', function() {
  return gulp.src(['Gulpfile.js', 'src/js/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('js', ['jshint'], function () {
  return gulp.src('src/js/main.js')
    .pipe(browserify({ debug: !production }))
    .pipe(concat('all.js'))
    .pipe(gulpif(production, uglify()))
    .pipe(gulp.dest('out/js'))
    .pipe(gulpif(production, gzip()))
    .pipe(gulpif(production, gulp.dest('out/js')))
    .pipe(refresh(server));
});

gulp.task('css', function () {
  return gulp.src('src/css/**/*.styl')
    .pipe(stylus({ set: production ? ['compress', 'include css'] : ['include css'] }))
    .pipe(concat('all.css'))
    .pipe(gulp.dest('out/css'))
    .pipe(gulpif(production, gzip()))
    .pipe(gulp.dest('out/css'))
    .pipe(refresh(server));
});

gulp.task('images', function () {
  return gulp.src('src/images/**')
    .pipe(gulpif(production, imagemin()))
    .pipe(gulp.dest('out/images'))
    .pipe(refresh(server));
});

gulp.task('html', function () {
  return gulp.src('src/**/*.haml')
    .pipe(haml({ optimize: production }))
    .pipe(gulp.dest('out'))
    .pipe(gulpif(production, gzip()))
    .pipe(gulp.dest('out'))
    .pipe(refresh(server));
});

gulp.task('build-blog', function () {
    return gulp.src('src/blog')
      .pipe(exec('cd <%= file.path %> && jekyll build --destination ../../out/blog'));
});

gulp.task('build', ['js', 'css', 'images', 'html', 'resume', 'build-blog']);

gulp.task('lr-server', function (cb) {
  server.listen(config.lrport, function (err) {
    if (err) {
      console.log(err);
    }
  });

  cb(null);
});

gulp.task('start-server', ['build', 'lr-server'], function(cb) {
  express()
    .use(express.directory(__dirname + '/out'))
    .use(express.static(__dirname + '/out'))
    .listen(config.port, function() {
      console.log('Listening on port %s...', config.port);
    });

  cb(null);
});

gulp.task('watch', ['start-server'], function(cb) {
  gulp.watch(['src/js/**/*.js'], ['js']);
  gulp.watch('src/css/**/*.styl', ['css']);
  gulp.watch('src/images/**', ['images']);
  gulp.watch('src/**/*.haml', ['html']);

  cb(null);
});

gulp.task('server', ['watch']);

gulp.task('create-cname', ['build'], function (cb) {
  fs.writeFileSync('out/CNAME', 'tadeuzagallo.com');
  cb(null);
});

gulp.task('deploy', ['create-cname'], function () {
  return gulp.src('out')
    .pipe(exec('cd <%= file.path %> && git init && git add -A . && git c -m "deploy" && git push --force git@github.com:tadeuzagallo/tadeuzagallo.github.io.git master'));
});
