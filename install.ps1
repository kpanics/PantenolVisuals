# ═══════════════════════════════════════════════════
#  PantenolVisuals - Windows installer (one command):
#  irm https://raw.githubusercontent.com/kpanics/PantenolVisuals/main/install.ps1 | iex
# ═══════════════════════════════════════════════════
$ErrorActionPreference = "Stop"
$repo    = "https://github.com/kpanics/PantenolVisuals.git"
$branch  = "main"
$dest    = Join-Path $env:USERPROFILE "PantenolVisuals"
$zipUrl  = "https://codeload.github.com/kpanics/PantenolVisuals/zip/refs/heads/$branch"

Write-Host "======================================"
Write-Host "  PantenolVisuals - installer v2.7"
Write-Host "======================================"

if (Get-Command git -ErrorAction SilentlyContinue) {
  if (Test-Path (Join-Path $dest ".git")) {
    Write-Host "Found install - updating..."
    git -C $dest remote set-url origin $repo | Out-Null
    git -C $dest fetch origin "+refs/heads/${branch}:refs/remotes/origin/${branch}" -q
    git -C $dest reset --hard FETCH_HEAD -q
  } else {
    Write-Host "Cloning launcher..."
    git clone -q --depth 1 -b $branch $repo $dest
  }
} else {
  Write-Host "git not found - downloading zip..."
  $tmp = Join-Path $env:TEMP "pv-src"
  $zip = Join-Path $env:TEMP "pv.zip"
  if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
  Invoke-WebRequest $zipUrl -OutFile $zip
  Expand-Archive -Force $zip $tmp
  $src = Join-Path $tmp "PantenolVisuals-$branch"
  if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
  Move-Item $src $dest
  Remove-Item $zip -Force
}

Write-Host "First launch (engine downloads once)..."
& (Join-Path $dest "launch.bat")

# Desktop shortcut
try {
  $ws  = New-Object -ComObject WScript.Shell
  $lnk = $ws.CreateShortcut((Join-Path ([Environment]::GetFolderPath("Desktop")) "PantenolVisuals.lnk"))
  $lnk.TargetPath       = Join-Path $dest "launch.bat"
  $lnk.WorkingDirectory = $dest
  $lnk.Description      = "PantenolVisuals - Minecraft Launcher"
  $ico = Join-Path $dest ".electron-win\bin\electron.exe"
  if (Test-Path $ico) { $lnk.IconLocation = "$ico,0" }
  $lnk.Save()
  Write-Host "Done! Desktop shortcut created."
} catch {
  Write-Host "Done! (shortcut skipped)"
}
