@echo off
setlocal

set "REPO_URL=https://github.com/Nikola0803/novaryn.git"
set "BRANCH=main"

cd /d "%~dp0"

echo ============================================
echo   VERTALIS COMMAND CENTER - Deploy to GitHub
echo   (merged CRM/CMS + storefront, same repo)
echo ============================================
echo.

where git >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Git is not installed or not in PATH.
    echo Install it from https://git-scm.com/download/win and run this file again.
    pause
    exit /b 1
)

if not exist ".git" (
    echo Initializing git repository...
    git init
)

git branch -M %BRANCH%

git remote get-url origin >nul 2>nul
if errorlevel 1 (
    echo Adding remote origin...
    git remote add origin %REPO_URL%
) else (
    echo Remote origin already set.
)

echo.
echo Removing node_modules, .next, and local secrets from tracking (if present)...
git rm -r --cached node_modules >nul 2>nul
git rm -r --cached .next >nul 2>nul
git rm --cached .env >nul 2>nul
git rm -r --cached public/uploads >nul 2>nul

echo Staging all changes...
git add -A

git diff --cached --quiet
if errorlevel 1 (
    echo Committing...
    git commit -m "Deploy %date% %time%"
) else (
    echo No local changes to commit.
)

echo.
echo Pushing to GitHub...
echo THIS REPLACES the current novaryn repo contents (storefront-only) with
echo the merged CRM+storefront app. Vercel will redeploy on this push.
echo.
git push -u origin %BRANCH% --force

if errorlevel 1 (
    echo.
    echo [ERROR] Push failed - see messages above.
    echo If a browser/credential window popped up, sign in to GitHub then run this file again.
) else (
    echo.
    echo Done. Pushed to %REPO_URL%
    echo Before this goes live: set the production env vars in the Vercel
    echo project settings (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL,
    echo WEBHOOK_SIGNING_SECRET, STORE_ORG_SLUG, STORE_BRAND_SLUG, and
    echo BLOB_READ_WRITE_TOKEN once a Blob store is connected for image
    echo uploads) - see the deployment notes Claude gave you.
)

echo.
pause
endlocal
