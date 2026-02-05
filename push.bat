@echo off
git add -A
if "%1"=="" (
  git commit -m "Update"
) else (
  git commit -m "%*"
)
git push origin main
