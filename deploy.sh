#!/bin/bash

# Update code from git
echo "Updating code from git"
git pull origin main --rebase

# Install dependencies
echo "Installing dependencies"
npm install
npm run migrate up
npm run test

# Restart the server
echo "Restarting the server"
pm2 del forum-api
pm2 start npm --name "forum-api" -- run start

echo "Deployment completed"