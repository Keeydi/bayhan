#!/bin/bash

CLEAN_CACHE=false
for arg in "$@"; do
  if [ "$arg" = "--clean-cache" ] || [ "$arg" = "-c" ]; then
    CLEAN_CACHE=true
  fi
done


if [ "$CLEAN_CACHE" = true ]; then
  echo "Cleaning yarn cache..."
  yarn cache clean
fi

echo "Removing existing node_modules directories..."
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

echo "Installing dependencies..."
yarn install --frozen-lockfile
yarn turbo db:generate