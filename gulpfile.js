var gulp = require("gulp");

var sass = require("gulp-sass"); // sassコンパイル
var sassGlob = require("gulp-sass-glob");

var autoprefixer = require("gulp-autoprefixer"); // ベンダープレフィックス自動付与
var plumber = require("gulp-plumber"); // コンパイルエラー時にコネクト解除しない
var notify  = require('gulp-notify'); // エラー時にデスクトップに通知
var browserSync = require("browser-sync"); // ブラウザー自動リロード
var gcmq = require('gulp-group-css-media-queries');//メディアクエリをまとめる
var uglify = require('gulp-uglify');
const babel = require('gulp-babel');

var webpackStream = require('webpack-stream');
var webpack = require('webpack');
const webpackConfig = require('./webpack.config');

var baseDir = './resource';
var dist = './public';


// browserSync sync
gulp.task('browser-sync', () => {
  return browserSync.init({
    server: {
      baseDir : dist, // 対象ディレクトリ
      index   : 'index.html' // インデックスファイル
    },
    reloadOnRestart: true
  });
});

//HTML PHP リロード自動更新
gulp.task("reload", (done) => {
  browserSync.reload();
  done();
});

//webpack
gulp.task('webpack', (done) => {
  webpackStream(webpackConfig, webpack).on('error', function (e) {
      this.emit('end');
  })
  .pipe(gulp.dest(dist + '/js/'));
  done();
})

//js minify
gulp.task('js-minify', function () {
  return gulp.src(baseDir +'/js/src/oresenGraphCC.js')
  .pipe(babel({
    "presets": ["@babel/preset-env"]
  }))
  .pipe(uglify())
  // .pipe(rename({ extname: '.min.js' }))
  .pipe(gulp.dest(dist + '/js/modules/'));
});

//sassコンパイル
gulp.task("sass", () => {
  return gulp.src(baseDir + "/sass/**/*.scss", {sourcemaps: true})
    .pipe(sassGlob()) // Sassの@importにおけるglobを有効にする
    .pipe(plumber({
        errorHandler: notify.onError('<%= error.message %>'),
    }))
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(autoprefixer({grid:true}))
    .pipe(gcmq())
    .pipe(gulp.dest(dist + "/css"), {sourcemaps: './maps'})
    .pipe(browserSync.stream());
});

// watch
gulp.task('watch', (done) => {
  gulp.watch(baseDir + '/sass/**/*.scss',gulp.series('sass'));
  gulp.watch(baseDir + '/js/**/*.js', gulp.series('js-minify','webpack', 'reload'));
  gulp.watch(dist + '/*.{html,php}',gulp.series('reload'));
  done();
});

//デフォルトタスク
gulp.task('default',
  gulp.series('watch', 'browser-sync')
);
