#!/usr/bin/env bash

# DayScore AI Launcher for macOS & Linux
set -e

echo "========================================================================"
echo "                     DayScore AI - macOS / Linux Runner"
echo "========================================================================"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo " [!] Node.js is not found on your system."
    echo " Please install Node.js (v18+) from https://nodejs.org or via your package manager."
    exit 1
fi

# Check for npm dependencies
if [ ! -d "node_modules" ]; then
    echo " [+] First-time setup: Installing dependencies..."
    npm install
fi

# Check for production dist build
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo " [+] Building production static assets..."
    npm run build
fi

echo ""
echo "========================================================================"
echo " [✓] Starting DayScore application at http://localhost:3000 ..."
echo "========================================================================"
echo ""

# Open browser automatically after 2 seconds in background
(
  sleep 2
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:3000" || true
  elif command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:3000" || true
  fi
) &

# Run start script
npm start
