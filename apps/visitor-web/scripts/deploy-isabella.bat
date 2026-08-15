@echo off
setlocal enabledelayedexpansion

echo ============================================
echo  Deploy Isabella AI - Edge Function + Env Vars
echo ============================================
echo.

REM --- Step 1: Check prerequisites ---
where npx >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js/npx no encontrado. Instalar desde https://nodejs.org
    exit /b 1
)

if "%SUPABASE_ACCESS_TOKEN%"=="" (
    echo [ERROR] Variable SUPABASE_ACCESS_TOKEN no definida.
    echo.
    echo  Crear token en: https://supabase.com/dashboard/account/tokens
    echo  Luego ejecutar antes del script:
    echo    set SUPABASE_ACCESS_TOKEN=tu_token_aqui
    exit /b 1
)

cd /d "%~dp0.."

echo [1/3] Desplegando edge function isabella-ai...
npx supabase functions deploy isabella-ai --project-ref lbbijzimnydvodtfbjoz
if %errorlevel% neq 0 (
    echo [ERROR] Fallo el deploy de isabella-ai
    exit /b 1
)
echo [OK] Function isabella-ai desplegada

echo.
echo [2/3] Configurando variables de entorno...
echo  Las siguientes variables DEBEN configurarse en Supabase Dashboard:
echo.
echo  Ir a: https://supabase.com/dashboard/project/nltsroirhecmteorywrv/edge-functions
echo  Seleccionar isabella-ai y hacer clic en "Environment Variables"
echo.
echo  Variables requeridas (al menos una):
echo   1. VERCEL_AI_GATEWAY_URL    - URL del AI Gateway de Vercel
echo   2. VERCEL_AI_GATEWAY_TOKEN  - Token del AI Gateway
echo   3. VERCEL_AI_GATEWAY_MODEL  - (opcional, default: claude-sonnet-4-20250514)
echo.
echo  O fallbacks:
echo   4. MODEL_ROUTER_URL         - URL del model router alternativo
echo   5. MODEL_ROUTER_TOKEN       - Token del model router
echo   6. GEMINI_API_KEY           - API key de Gemini (ultimo fallback)
echo.
echo  Tambien necesarias:
echo   - SUPABASE_URL              - (ya configurada automaticamente)
echo   - SUPABASE_SERVICE_ROLE_KEY - (ya configurada automaticamente)
echo.

echo [3/3] Verificando deploy...
npx supabase functions inspect isabella-ai --project-ref nltsroirhecmteorywrv
if %errorlevel% equ 0 (
    echo [OK] Function isabella-ai verificada
) else (
    echo [WARN] No se pudo verificar, revisar en el dashboard
)

echo.
echo ============================================
echo  Proceso completado.
echo  Isabella deberia estar online en pocos minutos.
echo ============================================
pause
