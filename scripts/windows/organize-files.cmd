@echo off
setlocal enabledelayedexpansion

echo ============================================
echo    ORGANIZARE AUTOMATA FISIERE PROIECT
echo ============================================
echo.

REM Creare structura foldere (daca nu exista)
echo [1/6] Creare structura foldere...
if not exist docs\setup mkdir docs\setup
if not exist docs\guides mkdir docs\guides
if not exist docs\optimization mkdir docs\optimization
if not exist docs\deployment mkdir docs\deployment
if not exist docs\migration mkdir docs\migration
if not exist docs\session-logs\2026-02-14 mkdir docs\session-logs\2026-02-14
if not exist docs\session-logs\2026-02-15 mkdir docs\session-logs\2026-02-15
if not exist docs\session-logs\2026-02-19 mkdir docs\session-logs\2026-02-19
if not exist scripts\windows mkdir scripts\windows
if not exist scripts\bash mkdir scripts\bash
if not exist scripts\powershell mkdir scripts\powershell
if not exist tests\api mkdir tests\api
if not exist tests\integration mkdir tests\integration
if not exist tests\data mkdir tests\data
if not exist reports mkdir reports
echo     - Foldere create cu succes!

REM ============================================
REM 2. MUTARE SCRIPTURI .cmd
REM ============================================
echo.
echo [2/6] Mutare scripturi .cmd in scripts\windows\...
for %%f in (
    start-sandbox.cmd
    stop-sandbox.cmd
    test-sandbox.cmd
    deploy-sandbox.cmd
    auto-setup-complete.cmd
    auto-cleanup-D-drive.cmd
    setup-kilo-indexing.cmd
    setup-windows-path.cmd
    run-migration.cmd
    verify-migration.cmd
    fix-duplicate-data.cmd
    repair-junction-points.cmd
    setup-future-installations.cmd
    START-MIGRATION.cmd
    RECOVERY-MIGRATION.cmd
    migrate-dev-data-to-D.cmd
    migrate-with-sandbox.cmd
    test-all-apis.cmd
) do (
    if exist "%%f" (
        move "%%f" scripts\windows\ >nul 2>&1
        echo     - Mutat: %%f
    )
)

REM ============================================
REM 3. MUTARE SCRIPTURI .sh
REM ============================================
echo.
echo [3/6] Mutare scripturi .sh in scripts\bash\...
for %%f in (
    deploy-module-2.3.sh
    deploy-now.sh
    deploy-to-server.sh
    check-server-version.sh
    reset-player-energy.sh
    setup-kilo-indexing.sh
    setup-ssh-tunnel.sh
    test-admin-api.sh
    test-admin-final.sh
    test-admin-working.sh
    test-all-apis-v2.sh
    test-complete-system.sh
    test-economic-loop-2.3.sh
    test-economy-comprehensive.sh
    test-localhost-api.sh
    test-macro-observer.sh
    test-module-2.3-complete.sh
    test-new-player-journey.sh
    test-production-admin.sh
    test-production-existing-account.sh
    test-production-new-account.sh
    test-timekeeper-comprehensive.sh
    test-timekeeper-status.sh
    test-work-flow-integration.sh
) do (
    if exist "%%f" (
        move "%%f" scripts\bash\ >nul 2>&1
        echo     - Mutat: %%f
    )
)

REM ============================================
REM 4. MUTARE SCRIPTURI .ps1
REM ============================================
echo.
echo [4/6] Mutare scripturi .ps1 in scripts\powershell\...
for %%f in (
    analyze-storage.ps1
    configure-docker-D-drive.ps1
    migrate-all-storage.ps1
    migrate-storage-to-D.ps1
    setup-windows-path.ps1
) do (
    if exist "%%f" (
        move "%%f" scripts\powershell\ >nul 2>&1
        echo     - Mutat: %%f
    )
)

REM ============================================
REM 5. MUTARE FISIERE TEST
REM ============================================
echo.
echo [5/6] Mutare fisiere test...

REM Teste .js in tests\api\
for %%f in (
    test-apis.js
    test-admin-panel.js
    test-economy-api-player.js
    test-transfer-fix.js
    init-user-balances.js
) do (
    if exist "%%f" (
        move "%%f" tests\api\ >nul 2>&1
        echo     - Mutat API test: %%f
    )
)

REM Fisiere JSON de test in tests\data\
for %%f in (
    test-admin-final.json
    test-consume.json
    test-game-auth.json
    test-login.json
    test-login2.json
    test-login-payload.json
    test-purchase.json
    test-signup2.json
    test-transfer.json
) do (
    if exist "%%f" (
        move "%%f" tests\data\ >nul 2>&1
        echo     - Mutat test data: %%f
    )
)

REM ============================================
REM 6. MUTARE RAPOARTE
REM ============================================
echo.
echo [6/6] Mutare rapoarte in reports\...
for %%f in (
    test-results.txt
    test-results-complete.txt
    test-results-final.txt
    test-results-v2-complete.txt
    test-final-all-28-apis.txt
    test-module-2.3-results.txt
    setup-report-20261502-155559.txt
    setup-report-20261502-160041.txt
    path-backup-20260215-160041.txt
) do (
    if exist "%%f" (
        move "%%f" reports\ >nul 2>&1
        echo     - Mutat: %%f
    )
)

REM ============================================
REM 7. STERGERE FISIER CORUPT
REM ============================================
echo.
echo Stergere fisier corupt...
if exist "console.log('Error" (
    del "console.log('Error" >nul 2>&1
    echo     - Sters: console.log('Error
)

echo.
echo ============================================
echo    ORGANIZARE COMPLETA!
echo ============================================
echo.
echo Structura finala:
echo   docs\setup\        - Ghiduri instalare
echo   docs\guides\       - Ghiduri diverse
echo   docs\optimization\ - Optimizari AI
echo   docs\deployment\   - Deploy, CI/CD
echo   docs\migration\    - Migrari storage
echo   docs\session-logs\ - Loguri pe zile
echo   docs\architecture\ - Documentatie tehnica
echo   scripts\windows\   - Scripturi .cmd
echo   scripts\bash\      - Scripturi .sh
echo   scripts\powershell\- Scripturi .ps1
echo   tests\api\         - Teste API .js
echo   tests\data\        - Fisiere JSON test
echo   reports\           - Rapoarte si rezultate
echo.
pause
