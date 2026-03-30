#!/usr/bin/env bash

set -euo pipefail

usage() {
    cat <<'EOF'
Usage:
  ./scripts/sync-version.sh <version>
  ./scripts/sync-version.sh --check <version>
EOF
}

CHECK_ONLY=0
if [[ "${1:-}" == "--check" ]]; then
    CHECK_ONLY=1
    shift
fi

if [[ $# -ne 1 ]]; then
    usage >&2
    exit 2
fi

VERSION="$1"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "error: version must look like 1.2.3" >&2
    exit 1
fi

if (( CHECK_ONLY )); then
    node - "$ROOT_DIR/package.json" "$ROOT_DIR/package-lock.json" "$VERSION" <<'EOF'
const fs = require("fs");

const [packagePath, lockPath, version] = process.argv.slice(2);
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));

const errors = [];
if (pkg.version !== version) {
  errors.push(`package.json version is '${pkg.version}', expected '${version}'`);
}
if (lock.version !== version) {
  errors.push(`package-lock.json version is '${lock.version}', expected '${version}'`);
}
if (lock.packages?.[""]?.version !== version) {
  errors.push(`package-lock.json root package version is '${lock.packages?.[""]?.version ?? ""}', expected '${version}'`);
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`error: ${error}`);
  }
  process.exit(1);
}

console.log(`Release version fields already match ${version}.`);
EOF
    exit 0
fi

node - "$ROOT_DIR/package.json" "$ROOT_DIR/package-lock.json" "$VERSION" <<'EOF'
const fs = require("fs");

const [packagePath, lockPath, version] = process.argv.slice(2);

function rewriteJson(filePath, mutator) {
  const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
  mutator(json);
  fs.writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`);
}

rewriteJson(packagePath, (pkg) => {
  pkg.version = version;
});

rewriteJson(lockPath, (lock) => {
  lock.version = version;
  if (lock.packages && lock.packages[""]) {
    lock.packages[""].version = version;
  }
});

console.log(`Updated release version to ${version}.`);
EOF
