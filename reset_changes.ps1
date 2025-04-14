Write-Host "Fetching latest changes from the repository..." -ForegroundColor Cyan
git fetch

Write-Host "Resetting to the functional_Dashboard branch from origin..." -ForegroundColor Cyan
git reset --hard origin/functional_Dashboard

Write-Host "Reset complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Current branch status:" -ForegroundColor Cyan
git status

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 