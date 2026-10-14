@echo off
setlocal
set "ROOT=%~dp0"
set "MAVEN=C:\Users\srir6\AppData\Roaming\Code\User\globalStorage\pleiades.java-extension-pack-jdk\maven\latest\bin\mvn.cmd"

if not exist "%MAVEN%" set "MAVEN=mvn"

start "Elderlink API" /D "%ROOT%backend" cmd /k "%MAVEN% spring-boot:run"
start "Elderlink Frontend" /D "%ROOT%frontend" cmd /k "node_modules\.bin\vite.cmd --host 0.0.0.0"

echo Elderlink is starting. Keep both server windows open, then visit http://localhost:5173.
endlocal