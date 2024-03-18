#! /bin/bash

find . -mindepth 1 -not -path "./node_modules/*" -and -not -path "*/node_mo
dules/*" -and -iname "package.json" | while read f; do
  echo ">> Bumping $f"
  # git status | grep ${f/.\//} > /dev/null \
  #   &&
    cd $(dirname $f) \
    && ../node_modules/.bin/release-it patch -c ../.release-it.json \
    && cd .. \
    && cat $f | jq -r .version
done
