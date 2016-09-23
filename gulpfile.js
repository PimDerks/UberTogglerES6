var gulp = require("gulp"),
    babel = require("gulp-babel"),
    browserify = require("browserify"),
    babelify = require('babelify'),
    browserSync = require('browser-sync').create(),
    Server = require('karma').Server,
    sass = require('gulp-sass'),
    plumber = require('gulp-plumber'),
    uglify = require('gulp-uglify'),
    buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps');

var dirs = {
    src: './src',
    dest: './dest',
    sass: './src/scss'
};

gulp.task("copy", function(){
    var src = [];
    src.push(dirs.src + "/**/*.html");

    return gulp.src(src)
        .pipe(gulp.dest(dirs.dest));
});

gulp.task('es6-amd', function(){
    return gulp.src(['src/**/*.js', '!src/**/*Spec.js'])
        .pipe(babel({
            presets: ['es2015'],
            plugins: ["transform-es2015-modules-amd"]
        }))
        .pipe(gulp.dest('amd'));
});

gulp.task("javascript", function () {
    return browserify({entries: './src/js/main.js', extensions: ['.js'], debug: true})
        .transform(babelify)
        .bundle()
        .pipe(source('bundle.js')) // gives streaming vinyl file object
        .pipe(buffer()) // convert from streaming to buffered vinyl file object
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify()) // now gulp-uglify works
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(dirs.dest));

});

gulp.task("compile", ["copy", "sass", "javascript"]);

gulp.task("watch", function(){
    gulp.watch(dirs.src + "/**/*", ["compile"]);
});

gulp.task("sass", function(){
    gulp.src(dirs.sass + '/style.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(gulp.dest(dirs.dest));
});

gulp.task("test", function (done) {

    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, function(){
        done()
    }).start();

});

gulp.task("watch-dist", function(){

    var timer;

    gulp.watch(dirs.dest + "**/*").on('change', function(){

        // throttle
        if(timer){
            clearTimeout(timer);
        }

        timer = setTimeout(function(){
            browserSync.reload()
        }, 100);

    });

});

gulp.task("serve", function(){

    browserSync.init({
        server: {
            baseDir: dirs.dest
        }
    });

});

// gulp.task("default", ["compile", "watch", "serve", "watch-dist", "test"]);
gulp.task("default", ["compile", "watch", "serve", "watch-dist"]);