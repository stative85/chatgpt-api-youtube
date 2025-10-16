#!/usr/bin/env bash
set -e

echo "🚀 Initializing Neuro-Engine repo"
git init
pnpm install
pnpm run lint
pnpm run test
pnpm run build
git add .
git commit -m "Initial Neuro-Engine commit"
echo "Enter GitHub repo (user/repo): "
read REPO
git remote add origin git@github.com:$REPO.git
git branch -M main
git push -u origin main
echo "🎉 Push complete — triggering CI/CD"
