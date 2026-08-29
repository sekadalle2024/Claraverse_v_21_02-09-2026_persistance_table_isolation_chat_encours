@echo off
echo.
echo ════════════════════════════════════════════════════════════
echo      PUSH E-AUDIT VERS DOCKER HUB
echo ════════════════════════════════════════════════════════════
echo.
echo Lancement via WSL2...
echo.

wsl bash -c "cd /mnt/d/ClaraVerse-v\ firebase && chmod +x push-dockerhub-wsl.sh && ./push-dockerhub-wsl.sh"

echo.
echo ════════════════════════════════════════════════════════════
echo.
pause
