#! /bin/bash


echo "Commit message is: $1"
cat $1

echo "Revised files are:"
git diff --cached --name-only