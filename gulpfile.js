'use strict';

const gulp = require('gulp');

gulp.task('default', function (cb) {
  gulp.src(['./lib/public/*.html', './lib/public/*.css'])
    .pipe(gulp.dest('build/lib/public'));
  cb();
});

