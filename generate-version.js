const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const pkg = require('./package.json');

exec('git log -1 --format=%cI;%H', { cwd: __dirname }, (err, stdout) => {
  const out = { date: null, hash: null, version: pkg.version || null };
  if (!err && stdout) {
    const parts = stdout.trim().split(';');
    out.date = parts[0] || null;
    out.hash = parts[1] || null;
  }

  const assetsDir = path.join(__dirname, 'src', 'assets');
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
  fs.writeFileSync(path.join(assetsDir, 'version.json'), JSON.stringify(out, null, 2));
  console.log('Wrote src/assets/version.json', out);
});

