import * as fs from "fs";
import * as gulp from "gulp";
import * as shell from "gulp-shell";

///
//  Build and tag the actual version, mark as latest, and also tag it with just the major and minor versions.
///
const [tagTask, pushTask] = createShellTasks("./package.json");

gulp.task("default", ["docker-build"]);

gulp.task("release", ["docker-push"]);

gulp.task("docker-build", tagTask);

gulp.task("docker-push", ["docker-build"], pushTask);

function versionMajorMinor(version: string) {
    const parts = version.split(".");

    if (parts.length === 3) {
        return [`${parts[0]}`, `${parts[0]}.${parts[1]}`];
    }

    return [null, null];
}

function createShellTasks(sourceFile) {
    const contents = fs.readFileSync(sourceFile).toString();

    const npmPackage = JSON.parse(contents);

    const version = npmPackage.version;
    const [versionMajor, versionMajMin] = versionMajorMinor(version);
    const repo = npmPackage.dockerRepository;
    const imageName = npmPackage.dockerImageName || npmPackage.name;

    const dockerRepoImage = `${repo}/${imageName}`;

    const imageWithVersion = `${dockerRepoImage}:${version}`;
    const imageWithVersionMajor = versionMajor ? `${dockerRepoImage}:${versionMajor}` : null;
    const imageWithVersionMajMin = versionMajMin ? `${dockerRepoImage}:${versionMajMin}` : null;
    const imageAsLatest = `${dockerRepoImage}:latest`;

    const buildCommand = `docker build --tag ${imageWithVersion} .`;
    const tagMajorCommand = imageWithVersionMajor ? `docker tag ${imageWithVersion} ${imageWithVersionMajor}` : `echo "could not tag with major version"`;
    const tagMajMinCommand = imageWithVersionMajMin ? `docker tag ${imageWithVersion} ${imageWithVersionMajMin}` : `echo "could not tag with major.minor version"`;
    const tagLatestCommand = `docker tag ${imageWithVersion} ${imageAsLatest}`;

    const pushCommand = `docker push ${imageWithVersion}`;
    const pushMajorCommand = imageWithVersionMajor ? `docker push ${imageWithVersionMajor}` : `echo "could not push major version"`;
    const pushMajMinCommand = imageWithVersionMajMin ? `docker push ${imageWithVersionMajMin}` : `echo "could not push major.minor version"`;
    const pushLatestCommand = `docker push ${imageAsLatest}`;

    return [
        shell.task([
            buildCommand,
            tagMajorCommand,
            tagMajMinCommand,
            tagLatestCommand
        ]),
        shell.task([
            pushCommand,
            pushMajorCommand,
            pushMajMinCommand,
            pushLatestCommand
        ])
    ];
}
