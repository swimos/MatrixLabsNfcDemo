#!/usr/bin/env bash
printf "Be sure you have run package.sh before running this.\n"
printf "Start Matrix Labs Demo App\n"

rm *.log
rm *.err

printf "Start Swim Server\n"
cd ./server/
./dist/swim-matrixlabs-nfc-3.10.0/bin/swim-matrixlabs-nfc  > ../swim.log 2> ../swim.err < /dev/null &

printf "Start Node Bridge\n"
cd ../bridge
npm start  > ../bridge.log 2> ../bridge.err < /dev/null &

cd ../

printf "Startup complete\n"