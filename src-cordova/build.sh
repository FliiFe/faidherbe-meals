#!/bin/bash

if [ "$1" = "release" ]; then
    echo -n "Store password: "
    read password
    echo -n "Key password: "
    read kpassword
    echo
    env TERM=xterm-color cordova build android --release -- --keystore="../../fliife_keystore.jks" --alias=fliife_keystore --storePassword=$password --password=$kpassword
else
    env TERM=xterm-color cordova build android
fi
