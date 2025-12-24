Write-Host "Starting Islamic Study Tools Website..." -ForegroundColor Green
Write-Host ""

Set-Location "Islamic Study Tools Frontend"

Write-Host "Installing dependencies (if needed)..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Yellow
npm run dev


