#!/bin/bash
set -e

SOURCE="scripts/setup_plugin.go"

OUTPUT_DIR="bin"

mkdir -p $OUTPUT_DIR

echo "Building plugin binaries..."

# macOS
GOOS=darwin GOARCH=amd64 go build -o $OUTPUT_DIR/setup-darwin-amd64 $SOURCE
GOOS=darwin GOARCH=arm64 go build -o $OUTPUT_DIR/setup-darwin-arm64 $SOURCE

# Linux
GOOS=linux GOARCH=amd64 go build -o $OUTPUT_DIR/setup-linux-amd64 $SOURCE
GOOS=linux GOARCH=arm64 go build -o $OUTPUT_DIR/setup-linux-arm64 $SOURCE

# Windows
GOOS=windows GOARCH=amd64 go build -o $OUTPUT_DIR/setup-windows-amd64.exe $SOURCE
GOOS=windows GOARCH=arm64 go build -o $OUTPUT_DIR/setup-windows-arm64.exe $SOURCE

echo "Build complete. Binaries are in the '$OUTPUT_DIR' directory."