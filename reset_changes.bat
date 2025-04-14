@echo off
echo Fetching latest changes from the repository...
git fetch
echo Resetting to the functional_Dashboard branch from origin...
git reset --hard origin/functional_Dashboard
echo Reset complete!
echo.
echo Current branch status:
git status
pause 