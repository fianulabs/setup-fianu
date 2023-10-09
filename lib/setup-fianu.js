// Node.js core
const os = require('os');
const path = require('path');
const exec = require('@actions/exec');

// External
const core = require('@actions/core');
const tc = require('@actions/tool-cache');

// arch in [arm, x32, x64...] (https://nodejs.org/api/os.html#os_os_arch)
// return value in [amd64, 386, arm]
function mapArch (arch) {
    const mappings = {
        x32: '386',
        x64: 'amd64'
    };
    return mappings[arch] || arch;
}

// os in [darwin, linux, win32...] (https://nodejs.org/api/os.html#os_os_platform)
// return value in [darwin, linux, windows]
function mapOS (os) {
    const mappings = {
        win32: 'windows'
    };
    return mappings[os] || os;
}

async function makeAvailableInPath(download, version) {
    let name = 'fianu'
    core.info(`Cache file ${download} and rename to ${name}`);
    const cachedPath = await tc.cacheFile(download, name, name, version);
    const filePath = path.join(cachedPath, name)

    core.info(`Making ${name} binary executable`);
    await exec.exec("chmod", ["+x", filePath]);

    core.info(`Make ${cachedPath} available in path`);
    core.addPath(cachedPath);
}

const isVersionLessThan = (version1, version2) => {
    const v1 = version1.split('.').map(Number);
    const v2 = version2.split('.').map(Number);

    for (let i = 0; i < v1.length; i++) {
        if (v1[i] < v2[i]) {
            return true;
        } else if (v1[i] > v2[i]) {
            return false;
        }
    }

    // If all numbers are equal, the versions are not less than each other
    return false;
}

async function run () {
    try {
        // Gather GitHub Actions inputs
        const version = core.getInput('version');

        // Gather OS details
        const osPlatform = os.platform();
        const osArch = os.arch();

        const platform = mapOS(osPlatform);
        const arch = mapArch(osArch);

        const getArchPath = (k) => {
            if (k === 'darwin') return 'arm64'
            if (arch === 'arm') return 'arm64'
            if (arch === 'amd64') return 'amd64_v1'
            return arch
        }

        // for backwards compatibility on older versions
        if (isVersionLessThan(version, '1.3.0')) {
            let url = `https://storage.googleapis.com/fianu-release/${version}/fianu`
            const pathToCLI = await tc.downloadTool(url, '');
            // Add to path
            await makeAvailableInPath(pathToCLI, version)
            return
        }

        let url = `https://storage.googleapis.com/fianu-release/${version}/dist`

        switch (platform) {
            case 'linux':
                url = url + '/cli_linux_' + getArchPath(platform) + '/cli'
                break
            case 'darwin':
                url = url + '/cli_darwin_' + getArchPath(platform) + '/cli'
                break
            case 'windows':
                url = url + '/cli_windows_' + getArchPath(platform) + '/cli.exe'
                break;
        }

        let pathToCLI;

        // Download requested version
        // const pathToCLI = await downloadCLI(url);
        switch (platform) {
            case 'linux':
            case 'darwin':
                pathToCLI = await tc.downloadTool(url, 'fianu');
                break;
            case 'windows':
                pathToCLI = await tc.downloadTool(url, 'fianu.exe');
                break;
        }

        // Add to path
        await makeAvailableInPath(pathToCLI, version)
    } catch (error) {
        core.error(error);
        throw error;
    }
}

module.exports = run;