var gulp = require('gulp'),
    git = require('gulp-git'),
    bump = require('gulp-bump'),
    shell = require('gulp-shell');


function incVersion(importance) {
    function getCurrentBranch() {
        return new Promise(function (resolve, reject) {
            git.revParse({
                args: '--abbrev-ref HEAD'
            }, function (err, stdout) {
                if (err) {
                    reject(err);
                } else {
                    resolve(stdout);
                }
            });
        });

    }

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
    return getCurrentBranch().then((branch) => {
        if (branch === 'master') {
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
    return gulp.src('.')
        .pipe(shell(['npm publish']));


})
gulp.task('commit-bump', function () {
    return gulp.src('.')
        .pipe(git.commit('[Prerelease] Bumped version number', {
            args: '-a'
        }));

})

gulp.task('save-change', function () {
    return gulp.src('.')
        .pipe(shell(['git commit -m "Bumped version number" -a','git push origin master']));
    //return git.push('origin', 'master');
})


gulp.task('create-new-tag', function (cb) {
    var version = getPackageJsonVersion();
    return git.tag(version, 'Created Tag for version: ' + version, function (error) {
        if (error) {
            return cb(error);
        }
        git.push('origin', 'master', {
            args: '--tags'
        }, cb);
    });

    function getPackageJsonVersion() {
        // 这里我们直接解析 json 文件而不是使用 require，这是因为 require 会缓存多次调用，这会导致版本号不会被更新掉
        return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
    };
});



gulp.task('publish-patch', gulp.series('build', 'inc-patch', 'save-change', 'create-new-tag', 'npm-publish', function (cb) {}));

gulp.task('publish-feature', gulp.series('build', 'inc-feature', 'save-change', 'create-new-tag', 'npm-publish', function (cb) {}));

gulp.task('publish-release', gulp.series('build', 'inc-release', 'save-change', 'create-new-tag', 'npm-publish', function (cb) {}));