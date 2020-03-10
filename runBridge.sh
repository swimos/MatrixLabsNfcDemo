#!/usr/bin/env bash

printf "Start Node Bridge\n"

rm bridge.log
rm bridge.err

cd ./bridge
npm start > ../bridge.log 2> ../bridge.err < /dev/null &

