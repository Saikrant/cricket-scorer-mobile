#!/bin/bash

# Deployment Script for Cricket Scorer Mobile

echo "🚀 Starting Deployment Process..."

# 1. Stage all changes
echo "📦 Staging changes..."
git add .

# 2. Commit changes
echo "📝 Committing..."
git commit -m "fix: resolve google sign-in deep link routing issues"

# 3. Push to GitHub
echo "⬆️ Pushing to GitHub..."
git push origin main

# 4. Build Android APK
echo "🏗️  Building Android APK (Preview)..."
echo "   NOTE: This might ask for keystore confirmation. Type 'Y' if prompted."
npx eas-cli build --platform android --profile preview

echo "✅ Script finished! Monitor the build URL above."
