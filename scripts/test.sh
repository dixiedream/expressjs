#!/bin/bash

echo "Checking if node_modules exists..."
if [ -e "node_modules" ]; then
   echo "Folder node exists, skipping installation"
else
   echo "Npm install..."
   exec npm install --quiet
fi

echo "Starting Jest in watch mode..."
exec npm run test