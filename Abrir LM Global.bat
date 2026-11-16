@echo off
rem Abre LM Global en el navegador con un servidor local (necesita Python 3).
title LM Global - servidor local
cd /d "%~dp0LM_Global"
echo.
echo   LM Global se abrira en tu navegador:  http://127.0.0.1:8000/
echo.
echo   Deja esta ventana abierta mientras ves la pagina.
echo   Para apagar el servidor, cierra esta ventana.
echo.
start "" /b cmd /c "ping -n 3 127.0.0.1 >nul & start http://127.0.0.1:8000/"
py -m http.server 8000 --bind 127.0.0.1
echo.
echo   El servidor no pudo iniciarse o se detuvo.
echo   - Si la pagina ya se abrio en el navegador, es que habia otro servidor encendido: puedes cerrar esta ventana.
echo   - Si no se abrio, comprueba que Python 3 este instalado (https://www.python.org/downloads/).
echo.
pause
