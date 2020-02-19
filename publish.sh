#! /bin/bash
set -xe

find . -mindepth 1 -maxdepth 1 -type d -not -iname "*.*" | while read d; do
    cd $d;
    echo "publishing itmcdev-$d...i"
    if [[ "$VSCE_TOKEN" != "" ]]; then
        vsce publish -p $VSCE_TOKEN;
    else
	    vsce publish;
    fi
    cd ..;
done
