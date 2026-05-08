@echo off
echo Forzando deployment de GitHub Pages...
echo.

echo 1. Creando commit vacío para triggear deployment...
git commit --allow-empty -m "deploy: forzar actualización de GitHub Pages"

echo.
echo 2. Subiendo cambios a GitHub...
git push origin master:main

echo.
echo 3. Deployment iniciado! 
echo Ve a: https://github.com/rafator11-beep/cabrerizos-fc/actions
echo Para ver el progreso del deployment.
echo.
echo La app estará disponible en:
echo https://rafator11-beep.github.io/cabrerizos-fc/
echo.
pause