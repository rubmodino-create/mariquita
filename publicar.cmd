@echo off
rem Actualiza las cartas y regalos desde ..\06_cartas y sube la web a GitHub Pages.
rem Doble clic para ejecutar.
cd /d "%~dp0"
node actualizar_cartas.js || goto error
git add -A
git diff --cached --quiet && (echo No hay cambios que publicar.& goto fin)
git commit -q -m "Actualizar cartas" || goto error
git push -q || goto error
echo.
echo Publicado. En 1-2 minutos estara en https://rubmodino-create.github.io/mariquita/
goto fin
:error
echo.
echo Algo ha fallado. Revisa el mensaje de arriba.
:fin
echo.
pause
