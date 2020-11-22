"use strict";

let gulp = require("gulp");
let pug = require("gulp-pug");
let plumber = require("gulp-plumber");
let sass = require("gulp-sass");
let cleanCSS = require("gulp-clean-css");
let sourcemaps = require("gulp-sourcemaps");
let shorthand = require("gulp-shorthand");
let autoprefixer = require("gulp-autoprefixer");
let rename = require("gulp-rename");
let svgstore = require("gulp-svgstore");
let server = require("browser-sync").create();
let del = require("del");

gulp.task("clean", function() {
	return del("public")
});

gulp.task("pug-components", function () {
  return gulp.src("dev/components/**/*.pug")
    .pipe(plumber())
    .pipe(pug())
    .pipe(gulp.dest("public/components/"))
});

gulp.task("pug-pages", function() {
	return gulp.src("dev/pages/*.pug")
	.pipe(plumber())
	.pipe(pug())
	.pipe(gulp.dest("public"))
});

gulp.task("components-css", function() {
	return gulp.src("dev/components/**/*.scss")
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(autoprefixer({
			cascade: false
			}))
		.pipe(shorthand())
		.pipe(cleanCSS({
			debug: true,
			compatibility: '*'
		}, details => {
		console.log(`${details.name}: Original size:${details.stats.originalSize} - Minified size: ${details.stats.minifiedSize}`)
		}))
		.pipe(sourcemaps.write())
		.pipe(rename({ suffix: ".min" }))
		.pipe(gulp.dest("public/components/"))
});

gulp.task("css", function() {
	return gulp.src("dev/scss/style.scss")
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(autoprefixer({
			cascade: false
			}))
		.pipe(shorthand())
		.pipe(cleanCSS({
			debug: true,
			compatibility: '*'
		}, details => {
		console.log(`${details.name}: Original size:${details.stats.originalSize} - Minified size: ${details.stats.minifiedSize}`)
		}))
		.pipe(sourcemaps.write())
		.pipe(rename({ suffix: ".min" }))
		.pipe(gulp.dest("public"))
});

gulp.task("svgSprite", function() {
	return gulp.src("dev/image/icon/*.svg")
	.pipe(svgstore({
		inlineSvg: true
	}))
	.pipe(rename("sprite.svg"))
	.pipe(gulp.dest("public/img"))
});

gulp.task("server", function () {
  server.init({
    server: "public/",
    notify: false,
    open: true,
    cors: true
  });

  gulp.watch("dev/**/*.scss", gulp.series("css", "components-css", "refresh"));
  gulp.watch("dev/**/*.pug", gulp.series("pug-pages", "pug-components", "refresh"));
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});


gulp.task("build", gulp.series(
	"clean",
	"svgSprite",
	"components-css",
	"css",
	"pug-components",
	"pug-pages"
));

gulp.task("start", gulp.series("build", "server"));