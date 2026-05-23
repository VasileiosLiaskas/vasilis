const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const pkg = require('./package.json');

function execAsync(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { cwd: __dirname }, (err, stdout) => {
      resolve({ err, stdout: (stdout || '').trim() });
    });
  });
}

/**
 * Writes src/assets/version.json used by the About modal.
 *
 * Pipeline/CI note:
 * - Git hooks do not run in CI.
 * - Shallow clones may not have tags/history.
 *
 * You can override values via env vars:
 *   APP_VERSION, GIT_COMMIT, GIT_COMMIT_SHA, BUILD_SOURCEVERSION,
 *   CI_COMMIT_SHA, GITHUB_SHA, APP_BUILD_DATE
 */
async function main() {
  const envHash =
    process.env.GIT_COMMIT ||
    process.env.GIT_COMMIT_SHA ||
    process.env.BUILD_SOURCEVERSION ||
    process.env.CI_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    null;

  const envDate = process.env.APP_BUILD_DATE || null;
  const envVersion = process.env.APP_VERSION || null;

  // Prefer git tag (vX.Y.Z) if available; fall back to package.json version.
  let version = envVersion || pkg.version || null;
  if (!envVersion) {
    const tagRes = await execAsync('git describe --tags --abbrev=0');
    if (!tagRes.err && tagRes.stdout) {
      version = tagRes.stdout.replace(/^v/, '');
    }
  }

  let date = envDate;
  let hash = envHash;

  if (!date || !hash) {
    const logRes = await execAsync('git log -1 --format=%cI;%H');
    if (!logRes.err && logRes.stdout) {
      const parts = logRes.stdout.split(';');
      date = date || parts[0] || null;
      hash = hash || parts[1] || null;
    }
  }

  const out = { date: date || null, hash: hash || null, version };

  const assetsDir = path.join(__dirname, 'src', 'assets');
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
  fs.writeFileSync(path.join(assetsDir, 'version.json'), JSON.stringify(out, null, 2));
  console.log('Wrote src/assets/version.json', out);
}

main().catch((e) => {
  console.error('generate-version.js failed', e);
  process.exitCode = 1;
});

