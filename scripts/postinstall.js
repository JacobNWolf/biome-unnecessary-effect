const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const platform = process.platform;
const arch = process.arch;

let binaryName;

const platformArchMapping = {
  'darwin-x64': 'setup-darwin-amd64',
  'darwin-arm64': 'setup-darwin-arm64',
  'linux-x64': 'setup-linux-amd64',
  'linux-arm64': 'setup-linux-arm64',
  'win32-x64': 'setup-windows-amd64.exe',
  'win32-arm64': 'setup-windows-arm64.exe',
};

const lookup = `${platform}-${arch}`;
binaryName = platformArchMapping[lookup];

if (!binaryName) {
  console.error(`Unsupported platform: ${lookup}`);
  console.error(
    'Please open an issue on the biome-unnecessary-effect GitHub repository to request support for your platform.',
  );
  process.exit(1);
}

const binaryPath = path.join(__dirname, '..', 'bin', binaryName);

if (!fs.existsSync(binaryPath)) {
  console.error(`Cannot find plugin binary for your platform: ${binaryPath}`);
  console.error('This is an issue with the package, not your machine.');
  console.error('Please open an issue on the biome-unnecessary-effect GitHub repository.');
  process.exit(1);
}

const child = execFile(binaryPath, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing plugin setup: ${error}`);
    if (stderr) console.error(stderr);
    return;
  }
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
});

child.on('close', (code) => {
  if (code !== 0) {
    console.error(`Plugin setup exited with code ${code}`);
    process.exit(code);
  }
});
