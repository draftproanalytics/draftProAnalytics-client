const { execSync } = require('node:child_process');
const fs = require('node:fs');

const sha = execSync('git rev-parse --short HEAD', {
  encoding: 'utf8',
}).trim();

const version = require('../package.json').version;

const release = `${version}+${sha}`;

fs.writeFileSync(
  '.env.release',
  `SENTRY_RELEASE=${release}\n`,
  'utf8',
);

console.log(`[release] ${release}`);