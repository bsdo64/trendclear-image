const  gulp = require('gulp'),
  mocha = require('gulp-mocha');

// identifies a dependent task must be complete before this watch begins
gulp.task('mocha', function() {
  process.stdout.write('\033c');

  gulp.src('**/__test__/**/*.test.js', {read: false})
    .pipe(mocha())
});

gulp.task('default', ['mocha']);