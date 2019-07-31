#!/bin/bash

cd server
npm run build
cp openpod-linux
cd ../client
npm run build
cd ../
  
if [[ $1 == "run" ]];
then
  ./openpod/openpod-linux
fi
