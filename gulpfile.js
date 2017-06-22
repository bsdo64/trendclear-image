const  gulp = require('gulp'),
  mocha = require('gulp-mocha');

// identifies a dependent task must be complete before this watch begins
gulp.task('mocha', function() {
  process.stdout.write('\033c');

  gulp.src('test/**/*.js', {read: false})
    .pipe(mocha({
      inspect: true,
      'trace-warnings': true
    }))
});

gulp.task('default', ['mocha']);