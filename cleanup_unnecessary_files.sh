#!/bin/bash

echo "=== Removing unnecessary files from Git ==="
echo ""

# Remove Replit-specific files
git rm --cached .replit 2>/dev/null
git rm --cached -r .local 2>/dev/null

# Remove all scripts and temp files
git rm --cached remove_sensitive_files.sh 2>/dev/null
git rm --cached cleanup_unnecessary_files.sh 2>/dev/null
git rm --cached tmp_* 2>/dev/null

# Remove build/test artifacts
git rm --cached *.log 2>/dev/null
git rm --cached migrations/*.sql 2>/dev/null

echo ""
echo "✅ Unnecessary files removed from Git tracking!"
echo ""
echo "Commit and push:"
echo "git commit -m 'Remove unnecessary files and cleanup repo'"
echo "git push origin main"
