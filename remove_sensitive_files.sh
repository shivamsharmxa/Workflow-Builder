#!/bin/bash

echo "=== Removing sensitive files from Git ==="
echo ""

# Remove .env files from Git tracking
git rm --cached .env
git rm --cached .env.example

# Remove all .md files except README.md
git rm --cached *.md
git rm --cached client/requirements.md

# Add back README.md (we want to keep this one)
git add README.md

echo ""
echo "✅ Files removed from Git tracking!"
echo ""
echo "Now commit and push:"
echo "git commit -m 'Remove sensitive files (.env and documentation)'"
echo "git push origin main"
