# start-db.ps1
$matlabBin = "C:\Program Files\MATLAB\R2025a\bin\win64"
$pgBin = "C:\Program Files\MATLAB\R2025a\sys\postgresql\win64\PostgreSQL\bin"
$env:PATH = "$matlabBin;$pgBin;$env:PATH"

$dbDir = "$env:USERPROFILE\.gemini\antigravity\scratch\transitops\pg_data"

if (-not (Test-Path $dbDir)) {
    Write-Host "Creating database directory and initializing database..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $dbDir -Force | Out-Null
    initdb -D $dbDir -U postgres -A trust
}

$pidFile = "$dbDir\postmaster.pid"
if (Test-Path $pidFile) {
    Write-Host "Database pid file found. Let us try to stop it first to ensure clean state..." -ForegroundColor Yellow
    pg_ctl -D $dbDir stop -m fast
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

Write-Host "Starting PostgreSQL on port 5432..." -ForegroundColor Green
pg_ctl -D $dbDir -o "-p 5432" -l "$dbDir\pg.log" start

Write-Host "PostgreSQL started successfully!" -ForegroundColor Green
