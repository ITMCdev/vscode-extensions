#! /bin/bash
set -xe

find . -mindepth 1 -maxdepth 1 -type d -not -iname "*.*" | while read d; do
    cd $d;
    echo "publishing itmcdev-$d..."
    if [[ "$VSCE_TOKEN" != "" ]]; then
        vsce publish -p $VSCE_TOKEN || true;
    else
	    vsce publish || true;
    fi
    cd ..;
done
