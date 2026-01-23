#!/bin/bash
# gotrain installer
# Usage: curl -sL https://raw.githubusercontent.com/gumadeiras/gotrain-cli/main/install.sh | bash

set -e

DEST_DIR="${HOME}/.local/bin"
BIN_NAME="gotrain"
REPO="gumadeiras/gotrain-cli"
RAW_URL="https://raw.githubusercontent.com/${REPO}/main/${BIN_NAME}"

echo "🚂 Installing gotrain..."

# Create directory if needed
mkdir -p "$DEST_DIR"

# Download binary
echo "  → Downloading to ${DEST_DIR}/${BIN_NAME}..."
curl -sL "$RAW_URL" -o "${DEST_DIR}/${BIN_NAME}"
chmod +x "${DEST_DIR}/${BIN_NAME}"

# Verify
if "${DEST_DIR}/${BIN_NAME}" --help >/dev/null 2>&1; then
    echo "✅ Installed! Run 'gotrain --help' to get started."
else
    echo "❌ Installation failed. Try adding ${DEST_DIR} to your PATH."
fi
