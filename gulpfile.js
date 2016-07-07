var gulp = require("gulp"),
    sourcemaps = require("gulp-sourcemaps"),
    babel = require("gulp-babel"),
    concat = require("gulp-concat"),
    browserify = require("browserify"),
    through2 = require("through2"),
    rename = require("gulp-rename"),
    browserSync = require('browser-sync').create();

var dirs = {
    src: './src',
    dest: './dest'
};

gulp.task("copy", function(){
    var src = [];
    src.push(dirs.src + "/**/*.html");

    return gulp.src(src)
        .pipe(gulp.dest(dirs.dest));
});

gulp.task("javascript", function () {
    return gulp.src('./src/js/main.js')
        .pipe(through2.obj(function (file, enc, next) {
            browserify(file.path, { debug: process.env.NODE_ENV === 'development' })
                .transform(require('babelify'))
                .bundle(function (err, res) {
                    if (err) { return next(err); }

                    file.contents = res;
                    next(null, file);
                });
        }))
        .on('error', function (error) {
            console.log(error.stack);
            this.emit('end');
        })
        .pipe(require('gulp-rename')('bundle.js'))
        .pipe(gulp.dest(dirs.dest));

});

gulp.task("compile", ["copy", "javascript"]);

gulp.task("watch", function(){
    gulp.watch(dirs.src + "/**/*", ["compile"]);
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

    // gulp.watch(dirs.dest + "/**/*").on("change", browserSync.reload);

});

gulp.task("default", ["compile", "watch", "serve", "watch-dist"]);