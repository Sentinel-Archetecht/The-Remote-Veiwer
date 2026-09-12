#!/usr/bin/env bash
set -euo pipefail

# Enforce deterministic environment variables
export SOURCE_DATE_EPOCH="1700000000"
export RUSTFLAGS="--remap-path-prefix=$(pwd)=/app -C debuginfo=0"

echo "[*] Cleaning previous artifacts..."
cargo clean

echo "[*] Compiling release binary with reproducible flags..."
cargo build --release --locked

# Target binary path
BINARY_PATH="target/release/remote-viewer-node"
MANIFEST_PATH="sha256sums.txt"

if [ -f "$BINARY_PATH" ]; then
    echo "[*] Generating cryptographic checksum..."
    sha256sum "$BINARY_PATH" > "$MANIFEST_PATH"
    echo "[+] Build complete. Checksum manifest created:"
    cat "$MANIFEST_PATH"
else
    echo "[-] Error: Binary build failed."
    exit 1
fi
