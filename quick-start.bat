@echo off
REM AI Detective - Quick Start Script for Windows
REM This script sets up and runs AI Detective locally in seconds

echo.
echo 🚀 AI Detective - Quick Start
echo ==============================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first:
    echo    https://nodejs.org/
    exit /b 1
)

echo ✓ Node.js found
node --version

REM Check if npm is installed
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    exit /b 1
)

echo ✓ npm found
npm --version

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo.
    echo 📦 Installing dependencies...
    call npm install
    echo ✓ Dependencies installed
) else (
    echo ✓ Dependencies already installed
)

REM Create .env.local if it doesn't exist
if not exist ".env.local" (
    echo.
    echo ⚙️  Creating .env.local...
    (
        echo USE_LLAMA=true
        echo OLLAMA_BASE_URL=http://localhost:11434
        echo LLAMA_MODEL=llama3.2
        echo NEXT_PUBLIC_CESIUM_BASE_URL=/cesium
    ) > .env.local
    echo ✓ Environment file created
) else (
    echo ✓ Environment file already exists
)

echo.
echo ✅ Setup complete!
echo.
echo Starting development server...
echo Open http://localhost:3000 in your browser
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the dev server
call npm run dev
