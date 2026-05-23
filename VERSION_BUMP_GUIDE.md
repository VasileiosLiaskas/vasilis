# Auto Version Bump Guide

When you push to the repository, the version in `package.json` will automatically be incremented from `0.2.0` → `0.2.1` → `0.2.2` etc. This happens via a Git pre-push hook.

## How it works

1. You make changes and commit them.
2. You run `git push`.
3. Before pushing, the `.githooks/pre-push` hook automatically runs `npm version patch`.
4. This bumps the patch version in `package.json` and creates a new commit and git tag.
5. Your push now includes the version bump commit.

## Setup (first time after cloning)

Run:
```bash
npm install
```

The `prepare` script (in `package.json`) will automatically configure Git to use `.githooks` as the hooks directory.

### For Windows users with JetBrains IDE (WebStorm, IntelliJ, etc.)

If you want to push via the IDE UI button instead of command line, make sure your IDE is using **Git from PATH** (not embedded Git). Check:

1. **WebStorm/IntelliJ Settings:**
   - Go to: `Settings → Version Control → Git`
   - Set "Git executable" to: `git` (or `C:\Program Files\Git\cmd\git.exe` on Windows)
   - Save and restart the IDE

2. After this, when you click **Push** in the IDE, the `.githooks/pre-push.bat` hook will run automatically and bump the version.

**If the IDE still doesn't run the hook**, use command line instead (Git push in terminal always works).

## Manual version bump (if needed)

To manually bump the version without pushing:

```bash
npm version patch      # 0.2.0 → 0.2.1 (patch)
npm version minor      # 0.2.0 → 0.3.0 (minor)
npm version major      # 0.2.0 → 1.0.0 (major)
```

## How the About modal uses the version

- When you build (`npm run build`), the `prebuild` script runs `generate-version.js`.
- This reads `package.json`, the last git commit date/hash, and writes to `src/assets/version.json`.
- The About modal displays this version (e.g., "PhotoFaliro version 0.2.1") along with the last commit date and hash.

## Disabling auto-bump (optional)

If you want to disable the pre-push hook temporarily:
```bash
git push --no-verify
```

## How to push (two options)

### Option 1: Command Line (Most Reliable ✅)
```bash
git push
```
The `.githooks/pre-push.bat` hook will run automatically and bump the version. **This always works.**

### Option 2: JetBrains IDE UI (Click Push Button)
If your IDE is configured to use Git from PATH (see setup section above), clicking **Push** in the IDE should also trigger the hook.

**If the hook doesn't run in the IDE:**
- Your IDE might be using embedded Git instead of system Git
- In that case, just use command line: `git push` (in terminal within IDE or external terminal)

## CI/CD

If using GitHub Actions or similar, the hook will also run in CI if the runner has a Git checkout. The build will always embed the current version in the bundled `version.json` asset.

