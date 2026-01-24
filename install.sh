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
echo " → Downloading to ${DEST_DIR}/${BIN_NAME}..."
# -f: fail on HTTP errors (404, 500)
# -s: silent
# -L: follow redirects
if curl -fsL "$RAW_URL" -o "${DEST_DIR}/${BIN_NAME}"; then
chmod +x "${DEST_DIR}/${BIN_NAME}"
else
echo "❌ Download failed! Check your internet or if the repo/file exists."
exit 1
fi

# Verify - check file exists and is executable
if [[ -x "${DEST_DIR}/${BIN_NAME}" ]]; then
    echo "✅ Installed! Run 'gotrain --help' to get started."
else
    echo "❌ Installation failed. File is not executable."
    exit 1
fi

# PATH check - add to both bashrc and zshrc if they exist
if [[ ":${PATH}:" != *":${DEST_DIR}:"* ]]; then
    echo "⚠️ Adding ${DEST_DIR} to PATH..."
    for rc in "$HOME/.bashrc" "$HOME/.zshrc"; do
        if [ -f "$rc" ]; then
            if ! grep -q "${DEST_DIR}" "$rc" 2>/dev/null; then
                echo "export PATH=\"${DEST_DIR}:\$PATH\"" >> "$rc"
            fi
        fi
    done
fi
