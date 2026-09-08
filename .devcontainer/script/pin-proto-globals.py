#! /usr/bin/env python3

"""Pin selected tools from workspace .prototools to proto global config."""

from __future__ import annotations

import subprocess
import sys
import tomllib
from pathlib import Path

TOOLS = ("node", "npm", "python")


def main() -> None:
    prototools = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".prototools")
    with prototools.open("rb") as f:
        data = tomllib.load(f)

    for tool in TOOLS:
        if tool not in data:
            print(f"error: {tool} not found in {prototools}", file=sys.stderr)
            sys.exit(1)
        version = str(data[tool])
        subprocess.run(
            ["proto", "pin", tool, version, "--to", "global"],
            check=True,
        )


if __name__ == "__main__":
    main()
