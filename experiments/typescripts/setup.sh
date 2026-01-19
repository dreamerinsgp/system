#!/bin/bash

# Setup script for TypeScript examples
# This script installs dependencies and sets up the environment

set -e

echo "=== Setting up TypeScript examples ==="
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Path from typescripts to clients/js: ../../clients/js
# typescripts is at: system/experiments/typescripts
# clients/js is at: system/clients/js
CLIENTS_JS_DIR="$SCRIPT_DIR/../../clients/js"
EXAMPLES_DIR="$SCRIPT_DIR"

echo "1. Installing dependencies in clients/js..."
cd "$CLIENTS_JS_DIR"
if [ -f "package.json" ]; then
    if [ -f "pnpm-lock.yaml" ]; then
        echo "   Using pnpm..."
        pnpm install
    else
        echo "   Using npm..."
        npm install
    fi
else
    echo "   ERROR: package.json not found in clients/js"
    exit 1
fi

echo ""
echo "2. Installing dependencies for examples..."
cd "$EXAMPLES_DIR"
if [ -f "package.json" ]; then
    npm install
else
    echo "   ERROR: package.json not found in examples directory"
    exit 1
fi

echo ""
echo "3. Verifying @solana/kit installation..."
if [ -d "$CLIENTS_JS_DIR/node_modules/@solana/kit" ]; then
    echo "   ✓ @solana/kit found"
else
    echo "   ✗ @solana/kit not found - please check installation"
    exit 1
fi

echo ""
echo "4. Verifying source code path..."
if [ -f "$CLIENTS_JS_DIR/src/index.ts" ]; then
    echo "   ✓ Source code found"
else
    echo "   ✗ Source code not found - please check path"
    exit 1
fi

echo ""
echo "=== Setup complete! ==="
echo ""
echo "To run the example:"
echo "  cd $EXAMPLES_DIR"
echo "  npm run create-account"
echo ""
echo "Make sure you have a Solana validator running on http://127.0.0.1:8899"

