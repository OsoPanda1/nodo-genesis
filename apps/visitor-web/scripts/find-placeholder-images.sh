#!/bin/bash
# Identifies placeholder images (1,696,555 bytes, identical MD5: 86f27360687a56932b2b03f7d1fe91c1)
# These are 28 placeholder files that need to be replaced with real assets.

EXPECTED_HASH="86f27360687a56932b2b03f7d1fe91c1"
echo "Placeholder images (replace with real assets):"
find src/assets/images -name "*.jpg" -exec md5sum {} \; | grep "$EXPECTED_HASH" | while read -r hash path; do
  echo "  $path"
done
echo ""
echo "Total: $(find src/assets/images -name "*.jpg" -exec md5sum {} \; | grep -c "$EXPECTED_HASH") placeholder images"
