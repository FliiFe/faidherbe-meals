#!/bin/bash

if [ "$1" = "release" ]; then
    cd front
    npm run build
    cd ..
    echo -n "Store password: "
    read password
    echo -n "Key password: "
    read kpassword
    echo
    env TERM=xterm-color cordova build android --release -- --keystore="../fliife_keystore.jks" --alias=fliife_keystore --storePassword=$password --password=$kpassword
else
    cd front
    npm run build
    cd ..
    env TERM=xterm-color cordova build android
fi
