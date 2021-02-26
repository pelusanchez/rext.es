const gulp = require('gulp');
const { src, dest, parallel } = gulp;
const sass = require('gulp-sass');
const minifyCSS = require('gulp-csso');
const concat = require('gulp-concat');
const uglifyjs = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin')
const babel = require('gulp-babel');
const cleanCSS = require('gulp-clean-css');
var fs = require('fs');

var run = require('gulp-run');


const buildPath = 'build/'
const __PATH__ = 'src/'

var globalCss = [
__PATH__ + 'normalize.css',
__PATH__ + 'sliders.css',
__PATH__ + 'loading-bar.css',
__PATH__ + 'scrollbar.css'];
var globalJs = [
__PATH__ + 'editor.js',
__PATH__ + 'system_solver_refactored.js',
__PATH__ + 'popup.js',
__PATH__ + 'UI.js',
__PATH__ + 'shaders.js',
__PATH__ + 'locale.js',
__PATH__ + 'params.js',
__PATH__ + 'serviceWorker-register.js'];

const watchFiles = [
  __PATH__ + 'editor.js',
  __PATH__ + 'system_solver_refactored.js',
  __PATH__ + 'popup.js',
  __PATH__ + 'UI.js',
  __PATH__ + 'locale.js',
  __PATH__ + 'params.js',
  __PATH__ + 'serviceWorker-register.js'];

gulp.task('genShaders', function (done) {
  
  return new Promise((resolve, reject) => {
    var fragment = fs.readFileSync(__PATH__ + 'fragment_shader.frag').toString()
    var vertex = fs.readFileSync(__PATH__ + 'vertex_shader.vert').toString()
    vertex = vertex.replace(/\n/g, '');
    fragment = fragment.replace(/\n/g, '');
    vertex = vertex.replace(/\s+/g, ' ');
    fragment = fragment.replace(/\s+/g, ' ');
    var shadersContent = `const __SHADERS__ = {
      VERTEX: \`${vertex}\`,
      FRAGMENT: \`${fragment}\`
    }`;

    fs.writeFileSync(__PATH__ + 'shaders.js', shadersContent)
    resolve();
  });

});

gulp.task('html', function (done) {
  return src(__PATH__ + '*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(buildPath))

});

gulp.task('cssDesktop',  function (done) {
  return src([...globalCss, __PATH__ + 'desktop.css'])
    .pipe(concat('desktop.style.css'))
    .pipe(cleanCSS())
    .pipe(dest(buildPath))

});

gulp.task('cssMobile',  function (done) {
  return src([...globalCss, __PATH__ + 'mobile.css'])
    .pipe(concat('mobile.style.css'))
    .pipe(cleanCSS())
    .pipe(dest(buildPath))

});


gulp.task('jsDesktop', function (done) {
  return src([...globalJs, __PATH__ + 'desktop.js'], { sourcemaps: false })
    .pipe(concat('desktop.min.js'))
    .pipe(dest(buildPath, { sourcemaps: false }))

});

gulp.task('jsMobile', function (done) {
  return src([...globalJs, __PATH__ + 'mobile.js', __PATH__ + 'UI_mobile.js',], { sourcemaps: false })
    .pipe(concat('mobile.min.js'))
    .pipe(dest(buildPath, { sourcemaps: false }))

});

gulp.task('closureMobile', function(done) {
  return src(
    [buildPath + '/mobile.min.js',
     ])
    .pipe(dest(buildPath, { sourcemaps: false }))

})

gulp.task('closureDesktop', function(done) {
  return src(
    [buildPath + '/desktop.min.js',
     ])
    .pipe(dest(buildPath, { sourcemaps: false }))

})

gulp.task('image', function (done) {
  return src(__PATH__ + '*.jpg')
    .pipe(dest(buildPath))

});

gulp.task("json", function(done) {
  return src(__PATH__ + "*.json")
  .pipe(dest(buildPath))
})

gulp.task("serviceWorker", function(done) {
  return src(__PATH__ + "serviceWorker.js")
  .pipe(dest(buildPath))
})

var commonTasks = ['genShaders', `cssDesktop`, `cssMobile`, `jsDesktop`, `jsMobile`, 'html', 'image', 'json', 'closureDesktop', 'closureMobile', 'serviceWorker'];


gulp.task('default', gulp.series([...commonTasks]))
