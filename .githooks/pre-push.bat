@echo off
REM Pre-push hook for Windows: auto-bump version before pushing
REM This runs 'npm version patch' to increment the patch version in package.json

echo.
echo 📦 Auto-bumping version...
echo.

call npm version patch

if errorlevel 1 (
  echo.
  echo ❌ Version bump failed, aborting push.
  echo.
  exit /b 1
)

echo.
echo ✅ Version bumped successfully!
echo.
exit /b 0

