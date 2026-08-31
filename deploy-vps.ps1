# Deploy peptides-crm-app straight to the VPS over SSH/SCP — no GitHub involved.
# Edit the three variables below once, then just run this script each time
# you want to push a new version live.

$VPS_HOST = "root@YOUR_VPS_IP"          # e.g. root@203.0.113.10 (or use the hostname if that resolves)
$VPS_PATH = "/var/www/peptide-command-center"
$PM2_NAME = "peptide-crm"

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root

Write-Host "============================================"
Write-Host "  Deploying to $VPS_HOST`:$VPS_PATH"
Write-Host "============================================"

# 1. Build a clean archive — only source + config, nothing generated/huge.
$archive = Join-Path $root "deploy-package.tar.gz"
if (Test-Path $archive) { Remove-Item $archive -Force }

Write-Host "`nPackaging (excluding node_modules, .next, .git, .env, uploads, zips/rars)..."
tar --exclude="node_modules" `
    --exclude=".next" `
    --exclude=".git" `
    --exclude=".git.sandbox-incomplete.bak" `
    --exclude=".env" `
    --exclude="public/uploads" `
    --exclude="*.zip" `
    --exclude="*.rar" `
    --exclude="*.tar.gz" `
    -czf $archive .

$sizeMB = [math]::Round((Get-Item $archive).Length / 1MB, 1)
Write-Host "Package built: $archive ($sizeMB MB)"

# 2. Copy it to the VPS.
Write-Host "`nCopying to VPS..."
scp $archive "${VPS_HOST}:/tmp/deploy-package.tar.gz"

# 3. Extract + install + build + restart, all remotely over SSH.
Write-Host "`nDeploying on VPS..."
$remoteScript = @"
set -e
mkdir -p $VPS_PATH
tar -xzf /tmp/deploy-package.tar.gz -C $VPS_PATH
rm /tmp/deploy-package.tar.gz
cd $VPS_PATH
npm install
npx prisma generate
npx prisma db push
npm run build
if pm2 describe $PM2_NAME > /dev/null 2>&1; then
  pm2 restart $PM2_NAME
else
  pm2 start npm --name "$PM2_NAME" -- start
fi
pm2 save
echo "Deploy complete."
"@

ssh $VPS_HOST $remoteScript

Remove-Item $archive -Force
Write-Host "`nDone. Live at whatever domain/port this VPS process is bound to."
