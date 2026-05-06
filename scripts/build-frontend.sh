#!/bin/bash
set -e
cd "$(dirname "$0")/../frontend"
pnpm install
pnpm run build
cp -r dist/* ../backend/public/
echo "Frontend built and copied to backend/public/"
