#!/bin/bash

# Deployment Script for Cricket Scorer Mobile

echo "🚀 Starting Deployment Process..."

# 1. Stage all changes
echo "📦 Staging changes..."
git add .

# 2. Commit changes
echo "📝 Committing..."
git commit -m "feat: google sign-in fix, live scorecard, and dashboard status improvements"

# 3. Push to GitHub
echo "⬆️ Pushing to GitHub..."
git push origin main

# 4. Build Android APK
echo "🏗️  Building Android APK (Preview)..."
echo "   NOTE: This might ask for keystore confirmation. Type 'Y' if prompted."
npx eas-cli build --platform android --profile preview --non-interactive

# # 5. Build iOS Simulator (Free, for Mac testing)
# echo "🏗️  Building iOS Simulator App..."
# echo "   NOTE: This creates a file you can run on your Mac's iOS Simulator."
# npx eas-cli build --platform ios --profile ios-simulator --non-interactive

echo "✅ Script finished! Monitor the build URLs above."
