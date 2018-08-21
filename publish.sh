#! /bin/bash

find . -mindepth 1 -maxdepth 1 -type d -not -iname "*.*" | while read d; do
    cd $d
    vsce publish
    cd ..
done