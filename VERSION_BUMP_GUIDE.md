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

## CI/CD

If using GitHub Actions or similar, the hook will also run in CI if the runner has a Git checkout. The build will always embed the current version in the bundled `version.json` asset.

