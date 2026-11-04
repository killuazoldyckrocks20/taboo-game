#!/usr/bin/env bash
# ==============================================================================
# TABOO GAME - ONE-CLICK AUTO DEPLOY SCRIPT
# ------------------------------------------------------------------------------
# Automatically:
# 1. Bumps the Service Worker cache version in sw.js (so reloads show new code)
# 2. Stages all changes (git add .)
# 3. Commits with a custom or timestamped message
# 4. Pushes to GitHub main branch
# ==============================================================================

set -e

# Change directory to script repository root
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

# Ensure git commands succeed smoothly in all environments
export GIT_CONFIG_GLOBAL=/dev/null

echo "========================================="
echo "🚀 Taboo Game - One-Click GitHub Deployer"
echo "========================================="

# 1. Check if git repo exists
if [ ! -d ".git" ]; then
  echo "❌ Error: Not a git repository!"
  exit 1
fi

# 2. Check if there are any code changes before bumping cache
CHANGED_FILES=$(git status --porcelain | grep -v "sw.js" || true)
if [ -z "$CHANGED_FILES" ] && [ -z "$1" ]; then
  echo "ℹ️ No code changes detected. Everything is already up to date!"
  exit 0
fi

# 3. Bump Service Worker cache version in sw.js to invalidate old browser caches
if [ -f "sw.js" ]; then
  echo "📦 Updating Service Worker cache version in sw.js..."
  python3 - << 'EOF'
import re

try:
    with open("sw.js", "r", encoding="utf-8") as f:
        content = f.read()

    match = re.search(r'const CACHE_NAME = "taboo-game-v(\d+)";', content)
    if match:
        old_ver = int(match.group(1))
        new_ver = old_ver + 1
        updated = re.sub(
            r'const CACHE_NAME = "taboo-game-v\d+";',
            f'const CACHE_NAME = "taboo-game-v{new_ver}";',
            content
        )
        with open("sw.js", "w", encoding="utf-8") as f:
            f.write(updated)
        print(f"   ✓ Service Worker Cache: v{old_ver} -> v{new_ver} (browser reloads will fetch fresh files)")
    else:
        print("   ℹ️ Cache version pattern not found in sw.js, skipping bump.")
except Exception as e:
    print(f"   ⚠️ Could not bump cache version: {e}")
EOF
fi

# 3. Stage all changed and untracked files
echo "📂 Staging all changes for git..."
git add .

# 4. Check if there are any changes to commit
if git diff --cached --quiet; then
  echo "ℹ️ No changes detected to commit. Everything is already up to date!"
  exit 0
fi

# 5. Commit message (custom argument or default timestamp)
COMMIT_MSG="$1"
if [ -z "$COMMIT_MSG" ]; then
  DATE_STR=$(date "+%Y-%m-%d %H:%M:%S")
  COMMIT_MSG="Update Taboo game: $DATE_STR"
fi

echo "📝 Committing: \"$COMMIT_MSG\"..."
git commit -m "$COMMIT_MSG"

# 6. Push to GitHub
echo "🌐 Pushing to GitHub remote (origin main)..."
git push origin main

echo ""
echo "============================================================"
echo "🎉 SUCCESS! Your changes have been pushed to GitHub."
echo "🌐 Live URL: https://killuazoldyckrocks20.github.io/taboo-game/"
echo ""
echo "💡 TIP: GitHub Pages updates within ~30-60 seconds."
echo "   Simply reload the page (or hard reload: Cmd+Shift+R / Ctrl+F5)"
echo "   to see the latest version immediately!"
echo "============================================================"
