
printf "Packaging app\n"
cd server/
rm -rf ./dist
mkdir ./dist

printf "\nBuild App Server\n"
./gradlew build

printf "\nPrepare App Server Dist folder\n"
tar -xf ./build/distributions/swim-matrixlabs-nfc-3.10.0.tar -C ./dist/

cd ../

printf "\ndone.\n"