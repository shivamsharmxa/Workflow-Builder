#!/bin/bash

echo "=== FINAL CLEANUP - Removing ALL Unnecessary Files ==="
echo ""

# Remove Replit files
echo "Removing Replit files..."
git rm --cached .replit
git rm --cached -r .local

# Remove .env files
echo "Removing .env files..."
git rm --cached .env
git rm --cached .env.example

# Remove ALL .md files except README.md
echo "Removing documentation .md files..."
git rm --cached BROWSER_ACCESS_FIX.md
git rm --cached CLERK_SETUP.md
git rm --cached DEMO_SCRIPT.md
git rm --cached FINAL_SUBMISSION_CHECKLIST.md
git rm --cached IMPLEMENTATION_STATUS.md
git rm --cached IMPLEMENTATION_SUMMARY.md
git rm --cached PROFESSIONAL_TESTING_GUIDE.md
git rm --cached STATUS.md
git rm --cached TESTING_RESULTS.md
git rm --cached TRANSLOADIT_SETUP.md
git rm --cached UI_RESTORED.md
git rm --cached WORKFLOW_TESTING_GUIDE.md
git rm --cached client/requirements.md

# Remove cleanup scripts
echo "Removing cleanup scripts..."
git rm --cached remove_sensitive_files.sh
git rm --cached cleanup_unnecessary_files.sh
git rm --cached final_cleanup.sh

# Add back README.md (we want to keep this)
git add README.md

echo ""
echo "✅ All unnecessary files removed from Git!"
echo ""
echo "Files removed:"
echo "- .replit and .local/ (Replit files)"
echo "- .env and .env.example (sensitive)"
echo "- All .md documentation files (except README.md)"
echo "- Cleanup scripts"
echo ""
echo "Now run:"
echo "  git commit -m 'Clean repository - remove unnecessary files'"
echo "  git push origin main --force"
echo ""
echo "⚠️  Note: Using --force because we're rewriting history"
