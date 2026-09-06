#!/bin/sh
set -eu

# AppImage type 2: SquashFS is appended immediately after the ELF,
# including the section-header table.
# readelf labels are locale-sensitive; keep C so the English keys match.

IMG=/opt/orca/orca-linux.AppImage
DEST=/opt/orca/squashfs-root

offset="$(LC_ALL=C readelf -h "${IMG}" | awk '
  /Start of section headers:/ { shoff = $5 }
  /Size of section headers:/ { shentsize = $5 }
  /Number of section headers:/ { shnum = $5 }
  END { print shoff + (shnum * shentsize) }
')"

case "${offset}" in
  '' | *[!0-9]* | 0)
    echo "invalid squashfs offset from ELF headers: '${offset}'" >&2
    LC_ALL=C readelf -h "${IMG}" >&2
    exit 1
    ;;
esac

echo "Extracting Orca AppImage squashfs at offset ${offset}"
unsquashfs -f -o "${offset}" -d "${DEST}" "${IMG}"
chmod -R a+rX "${DEST}"
rm "${IMG}"
