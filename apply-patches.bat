@echo off
echo Aplicando parches de Cabrerizos FC...

echo.
echo 1. Copiando useIsMobile.js mejorado...
copy "src\hooks\useIsMobile.js" "..\..\..\tu-proyecto-principal\src\hooks\useIsMobile.js"

echo.
echo 2. Aplicando hotfix de GitHub Pages...
copy "..\cabrerizos-fc-pages-hotfix\src\main.jsx" "..\..\..\tu-proyecto-principal\src\main.jsx"
copy "..\cabrerizos-fc-pages-hotfix\src\index.css" "..\..\..\tu-proyecto-principal\src\index.css"

echo.
echo ¡Parches aplicados! Recuerda hacer el cambio manual en Tactica.jsx:
echo const [mobileTab, setMobileTab] = useState('campo');
echo.
pause