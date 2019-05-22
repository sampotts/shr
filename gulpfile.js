// ==========================================================================
// Gulp build script
// ==========================================================================

const path = require('path');
const gulp = require('gulp');
// ------------------------------------
// CSS
// ------------------------------------
const less = require('gulp-less');
const sass = require('gulp-sass');
const clean = require('gulp-clean-css');
const prefix = require('gulp-autoprefixer');
// ------------------------------------
// JavaScript
// ------------------------------------
const terser = require('gulp-terser');
const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const sourcemaps = require('gulp-sourcemaps');
// ------------------------------------
// Images
// ------------------------------------
const svgstore = require('gulp-svgstore');
const imagemin = require('gulp-imagemin');
// ------------------------------------
// Utils
// ------------------------------------
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const size = require('gulp-size');
const ansi = require('ansi-colors');
const log = require('fancy-log');
const del = require('del');
const through = require('through2');
// ------------------------------------
// Deployment
// ------------------------------------
const aws = require('aws-sdk');
const publish = require('gulp-awspublish');
const FastlyPurge = require('fastly-purge');
// ------------------------------------
// Configs
// ------------------------------------
const pkg = require('./package.json');
const build = require('./build.json');
const deploy = require('./deploy.json');
// ------------------------------------
// Get info from package
// ------------------------------------
const { browserslist, version } = pkg;

// Get AWS config
Object.values(deploy).forEach(target => {
    Object.assign(target, {
        publisher: publish.create({
            region: target.region,
            params: {
                Bucket: target.bucket,
            },
            credentials: new aws.SharedIniFileCredentials({ profile: 'shr' }),
        }),
    });
});

const root = __dirname;
const paths = {
    shr: {
        // Source paths
        src: {
            sass: path.join(root, 'src/sass/**/*'),
            js: path.join(root, 'src/js/**/*'),
            sprite: path.join(root, 'src/sprite/*.svg'),
        },
    },
    demo: {
        // Source paths
        src: {
            less: path.join(root, 'demo/src/less/**/*'),
            js: path.join(root, 'demo/src/js/**/*'),
            sprite: path.join(root, 'demo/src/sprite/**/*'),
        },
        // Docs
        root: path.join(root, 'demo/'),
    },
    upload: [path.join(root, 'dist/**')],
};

// Task arrays
const tasks = {
    css: [],
    js: [],
    sprite: [],
};

// Babel config
const babelrc = {
    babelrc: false,
    presets: [
        '@babel/env',
        [
            'minify',
            {
                builtIns: false, // Temporary fix for https://github.com/babel/minify/issues/904
            },
        ],
    ],
};

// Size plugin
const sizeOptions = { showFiles: true, gzip: true };

// Clean out /dist
gulp.task('clean', done => {
    del(paths.upload.map(dir => path.join(dir, '*')));
    done();
});

// JavaScript
const namespace = 'Shr';

Object.entries(build.js).forEach(([filename, entry]) => {
    entry.formats.forEach(format => {
        const name = `js:${filename}:${format}`;
        tasks.js.push(name);

        gulp.task(name, () =>
            gulp
                .src(entry.src)
                .pipe(plumber())
                .pipe(sourcemaps.init())
                .pipe(
                    rollup(
                        {
                            plugins: [resolve(), commonjs(), babel(babelrc)],
                        },
                        {
                            name: namespace,
                            format,
                        },
                    ),
                )
                .pipe(terser())
                .pipe(
                    rename({
                        extname: `.${format === 'es' ? 'mjs' : 'js'}`,
                    }),
                )
                .pipe(size(sizeOptions))
                .pipe(sourcemaps.write(''))
                .pipe(gulp.dest(entry.dist)),
        );
    });
});

// CSS
Object.entries(build.css).forEach(([filename, entry]) => {
    const name = `css:${filename}`;
    tasks.css.push(name);

    gulp.task(name, () =>
        gulp
            .src(entry.src)
            .pipe(plumber())
            .pipe(path.extname(entry.src) === '.less' ? less() : sass())
            .pipe(
                prefix(browserslist, {
                    cascade: false,
                }),
            )
            .pipe(clean())
            .pipe(size(sizeOptions))
            .pipe(gulp.dest(entry.dist)),
    );
});

// SVG Sprite
Object.entries(build.sprite).forEach(([filename, entry]) => {
    const name = `sprite:${filename}`;
    tasks.sprite.push(name);

    gulp.task(name, () =>
        gulp
            .src(entry.src)
            .pipe(plumber())
            .pipe(
                imagemin([
                    imagemin.svgo({
                        plugins: [{ removeViewBox: false }],
                    }),
                ]),
            )
            .pipe(svgstore())
            .pipe(rename({ basename: path.parse(filename).name }))
            .pipe(size(sizeOptions))
            .pipe(gulp.dest(entry.dist)),
    );
});

// Watch for file changes
gulp.task('watch', () => {
    // Core
    gulp.watch(paths.shr.src.js, gulp.parallel(...tasks.js));
    gulp.watch(paths.shr.src.sass, gulp.parallel(...tasks.css));
    gulp.watch(paths.shr.src.sprite, gulp.parallel(...tasks.sprite));

    // Demo
    gulp.watch(paths.demo.src.js, gulp.parallel(...tasks.js));
    gulp.watch(paths.demo.src.less, gulp.parallel(...tasks.css));
});

// Default gulp task
gulp.task('default', gulp.series('clean', gulp.parallel(...tasks.js, ...tasks.css, ...tasks.sprite), 'watch'));

// Publish a version to CDN and demo
// --------------------------------------------
// Get deployment config
let credentials = {};
try {
    credentials = require('./credentials.json'); //eslint-disable-line
} catch (e) {
    // Do nothing
}
// Some options
const maxAge = 31536000; // seconds 1 year
const headers = {
    cdn: {
        'Cache-Control': `max-age=${maxAge}`,
    },
    demo: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    },
};

const regex =
    '(?:0|[1-9][0-9]*)\\.(?:0|[1-9][0-9]*).(?:0|[1-9][0-9]*)(?:-[\\da-z\\-]+(?:.[\\da-z\\-]+)*)?(?:\\+[\\da-z\\-]+(?:.[\\da-z\\-]+)*)?';
const semver = new RegExp(`v${regex}`, 'gi');
const cdnpath = new RegExp(`${deploy.cdn.domain}/${regex}`, 'gi');
const versionPath = `https://${deploy.cdn.domain}/${version}`;
const localpath = new RegExp('(../)?dist', 'gi');

// Publish version to CDN bucket
gulp.task('cdn', () => {
    const { domain, publisher } = deploy.cdn;

    if (!publisher) {
        throw new Error('No publisher instance. Check AWS configuration.');
    }

    log(`Uploading ${ansi.green.bold(pkg.version)} to ${ansi.cyan(domain)}...`);

    // Upload to CDN
    return gulp
        .src(paths.upload)
        .pipe(
            size({
                showFiles: true,
                gzip: true,
            }),
        )
        .pipe(
            rename(p => {
                // eslint-disable-next-line no-param-reassign
                p.dirname = p.dirname.replace('.', version);
            }),
        )
        .pipe(publisher.publish(headers.cdn))
        .pipe(publish.reporter());
});

// Replace versioned files in readme.md
gulp.task('demo:readme', () => {
    const { domain } = deploy.cdn;

    return gulp
        .src([`${root}/readme.md`])
        .pipe(replace(cdnpath, `${domain}/${version}`))
        .pipe(gulp.dest(root));
});

// Replace versions in shr.js
gulp.task('demo:src', () =>
    gulp
        .src(path.join(root, 'src/js/shr.js'))
        .pipe(replace(semver, `v${version}`))
        .pipe(gulp.dest(path.join(root, 'src/js/'))),
);

// Replace versions in shr.js
gulp.task('demo:svg', () => {
    const { domain, publisher } = deploy.cdn;

    if (!publisher) {
        throw new Error('No publisher instance. Check AWS configuration.');
    }

    return gulp
        .src(path.join(root, 'dist/app.js'))
        .pipe(replace(localpath, `https://${domain}/${version}`))
        .pipe(
            rename(p => {
                // eslint-disable-next-line no-param-reassign
                p.dirname = p.dirname.replace('.', version);
            }),
        )
        .pipe(publisher.publish(headers.cdn))
        .pipe(publish.reporter());
});

// Replace local file paths with remote paths in demo
// e.g. "../dist/shr.js" to "https://cdn.shr.one/x.x.x/shr.js"
gulp.task('demo:paths', () => {
    const { publisher } = deploy.demo;
    const { domain } = deploy.cdn;

    if (!publisher) {
        throw new Error('No publisher instance. Check AWS configuration.');
    }

    return gulp
        .src([`*.html`, `src/js/app.js`].map(p => path.join(paths.demo.root, p)))
        .pipe(replace(localpath, `https://${domain}/${version}`))
        .pipe(publisher.publish(headers.demo))
        .pipe(publish.reporter());
});

// Upload error.html to cdn (as well as demo site)
gulp.task('demo:error', () => {
    const { publisher } = deploy.demo;
    const { domain } = deploy.cdn;

    if (!publisher) {
        throw new Error('No publisher instance. Check AWS configuration.');
    }

    return gulp
        .src([`${paths.demo.root}error.html`])
        .pipe(replace(localpath, `https://${domain}/${version}`))
        .pipe(publisher.publish(headers.demo))
        .pipe(publish.reporter());
});

// Purge the fastly cache incase any 403/404 are cached
gulp.task('purge', () => {
    if (!Object.keys(credentials).includes('fastly')) {
        throw new Error('Fastly credentials required to purge cache.');
    }

    const { fastly } = credentials;
    const list = [];

    return gulp
        .src(paths.upload)
        .pipe(
            through.obj((file, enc, cb) => {
                if (file.stat.isFile()) {
                    const filename = file.path.split('/').pop();
                    list.push(`${versionPath}/${filename}`);
                }

                cb(null);
            }),
        )
        .on('end', () => {
            const purge = new FastlyPurge(fastly.token);

            list.forEach(url => {
                log(`Purging ${ansi.cyan(url)}...`);

                purge.url(url, (error, result) => {
                    if (error) {
                        log.error(error);
                    } else if (result) {
                        log(result);
                    }
                });
            });
        });
});

// Publish to Demo bucket
gulp.task('demo', gulp.parallel('demo:readme', 'demo:src', 'demo:svg', 'demo:paths', 'demo:error'));

// Do everything
gulp.task(
    'deploy',
    gulp.series('clean', gulp.parallel(...tasks.js, ...tasks.css, ...tasks.sprite), 'cdn', 'demo', 'purge'),
);
