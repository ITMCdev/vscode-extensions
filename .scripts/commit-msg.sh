#! /bin/bash


echo "Commit message is: $@"

echo "Revised files are:"
git diff --cached --name-only