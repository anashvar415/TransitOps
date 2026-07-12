# stop-db.ps1
$matlabBin = "C:\Program Files\MATLAB\R2025a\bin\win64"
$pgBin = "C:\Program Files\MATLAB\R2025a\sys\postgresql\win64\PostgreSQL\bin"
$env:PATH = "$matlabBin;$pgBin;$env:PATH"

$dbDir = "C:\Users\ASUS\.gemini\antigravity\scratch\transitops\pg_data"

Write-Host "Stopping PostgreSQL..." -ForegroundColor Yellow
pg_ctl -D $dbDir stop -m fast
Write-Host "PostgreSQL stopped successfully." -ForegroundColor Green
