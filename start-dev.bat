@echo off

:: Tu dong tim va tat tien trinh dang ket tren cong 3000 (neu co) truoc khi chay
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /F /PID %%a 2>nul

SET "NODE_PATH=d:\web-project-khachsan\scratch\node-v20.18.0-win-x64"
SET "PATH=%NODE_PATH%;%PATH%"
cd /d d:\web-project-khachsan
echo [Lumiere Hotel] Dang khoi dong server tai http://localhost:3000
npm run dev
pause
