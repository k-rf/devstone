#! /usr/bin/env bash

app=${APP_VSCODE_EXTENSIONS_VOLUME_NAME}

for volume in {${app},}; do
  echo "Remove extensions in ${volume}"
  docker run --rm -v ${volume}:/mnt/${volume} ubuntu:latest /bin/bash -c "rm -rf /mnt/${volume}/*"
done
