#!/usr/bin/env bash

set -euo pipefail

usage() {
    cat <<'EOF'
Usage:
  ./scripts/package-release.sh [output-dir]
  ./scripts/package-release.sh --skip-build [output-dir]
EOF
}

SKIP_BUILD=0
if [[ "${1:-}" == "--skip-build" ]]; then
    SKIP_BUILD=1
    shift
fi

if [[ $# -gt 1 ]]; then
    usage >&2
    exit 2
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="${1:-$ROOT_DIR/dist/release}"

if (( ! SKIP_BUILD )); then
    (
        cd "$ROOT_DIR"
        npm run build
    )
fi

PACKAGE_FILE="$(
    cd "$ROOT_DIR" &&
    node -p 'const pkg=require("./package.json"); `${pkg.name.replace(/^@/, "").replace(/\//g, "-")}-${pkg.version}.tgz`'
)"
PACKAGE_VERSION="$(
    cd "$ROOT_DIR" &&
    node -p 'require("./package.json").version'
)"

rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"
rm -f "$OUTPUT_DIR/$PACKAGE_FILE"

(
    cd "$ROOT_DIR"
    npm pack --pack-destination "$OUTPUT_DIR" >/dev/null
)

if [[ ! -f "$OUTPUT_DIR/$PACKAGE_FILE" ]]; then
    echo "error: missing packed archive at $OUTPUT_DIR/$PACKAGE_FILE" >&2
    exit 1
fi

(
    cd "$OUTPUT_DIR"
    shasum -a 256 "$PACKAGE_FILE" > SHA256SUMS.txt
)

SMOKE_DIR="$(mktemp -d)"
cleanup() {
    rm -rf "$SMOKE_DIR"
}
trap cleanup EXIT

npm install --global --prefix "$SMOKE_DIR/prefix" "$OUTPUT_DIR/$PACKAGE_FILE" >/dev/null
actual_version="$("$SMOKE_DIR/prefix/bin/gotrain" --version)"
if [[ "$actual_version" != "$PACKAGE_VERSION" ]]; then
    echo "error: packed gotrain reports $actual_version, expected $PACKAGE_VERSION" >&2
    exit 1
fi

echo "Wrote release assets to $OUTPUT_DIR"
