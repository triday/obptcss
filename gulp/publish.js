var gulp = require('gulp'),
    bump = require('gulp-bump'),
    process = require('child_process');

function runCommand(line) {
    return new Promise(function (resolve, reject) {
        process.exec(line, (error, stdout, stderr) => {
            if (error) reject(error);
            if (stderr) reject(error);
            resolve(stdout)
        });
    });
}

function incVersion(importance) {
    function inc(importance) {
        // get all the files to bump version in
        return gulp.src(['./package.json'])
            // bump the version number in those files
            .pipe(bump({
                type: importance
            }))
            // save it back to filesystem
            .pipe(gulp.dest('./'))
    }
    return runCommand('git rev-parse --abbrev-ref HEAD')
        .then((branch) => {
            if (branch.trim() === 'master') {
                return inc(importance)
            } else {
                throw new Error('Increase version only support in master branch.')
            }
        });
}

gulp.task('inc-patch', function () {
    return incVersion('patch');
});
gulp.task('inc-feature', function () {
    return incVersion('feature');
});
gulp.task('inc-release', function () {
    return incVersion('release');
});



//gulp patch     # makes v0.1.0 → v0.1.1
gulp.task('npm-publish', function () {
    return runCommand('npm publish');
})


gulp.task('save-change', function () {
        return runCommand('git commit -m "Bumped version number" -a')
        .then(()=>runCommand('git push origin master'))
})


gulp.task('create-new-tag', function (cb) {
    var version = getPackageJsonVersion();
    return runCommand(`git tag -a v${version}`)
           .then(()=>runCommand('git push origin master --tags'));

    function getPackageJsonVersion() {
        // 这里我们直接解析 json 文件而不是使用 require，这是因为 require 会缓存多次调用，这会导致版本号不会被更新掉
        return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
    };
});



gulp.task('publish-patch', gulp.series('build', 'inc-patch', 'save-change', 'create-new-tag', 'npm-publish', function (cb) {}));

gulp.task('publish-feature', gulp.series('build', 'inc-feature', 'save-change', 'create-new-tag', 'npm-publish', function (cb) {}));

gulp.task('publish-release', gulp.series('build', 'inc-release', 'save-change', 'create-new-tag', 'npm-publish', function (cb) {}));