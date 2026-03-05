#!/bin/bash

echo "Removing .local folder from Git..."

git rm -r --cached .local

echo ""
echo "✅ .local folder removed from Git tracking!"
echo ""
echo "Now commit and push:"
echo "git commit -m 'Remove .local folder'"
echo "git push origin main"
