#!/bin/bash

SCRIPT_NAME=$(basename "$0")

show_help() {
  cat << EOF
Usage: $SCRIPT_NAME [options]

Options:
  --node        Include node_modules in cleanup
  --yarn        Include yarn cache cleanup
  -h, --help    Show this help message

Description:
  This script cleans up common build artifacts and Yarn cache.
  By default, it removes:
    - build
    - .turbo
    - .next
    - dist
  If --node is passed, it will also remove:
    - node_modules
  If --yarn is passed, it will also clean the Yarn cache.
EOF
}

INCLUDE_NODE=false
INCLUDE_YARN=false

# Parse all arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --node)
      INCLUDE_NODE=true
      ;;
    --yarn)
      INCLUDE_YARN=true
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
  shift
done

if $INCLUDE_YARN; then
  echo "Cleaning Yarn cache..."
  yarn cache clean
fi

# Build directory list
DIRS="-name build -o -name .turbo -o -name .next -o -name dist"
if $INCLUDE_NODE; then
  DIRS="$DIRS -o -name node_modules"
fi

echo "Removing directories..."
# shellcheck disable=SC2086
find . -type d \( $DIRS \) -prune -exec rm -rf '{}' +

echo "Cleanup complete."
