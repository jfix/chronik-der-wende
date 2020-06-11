#!/bin/bash

if [ $# -ne 1 ]; then
    echo usage: $0 number
    exit 1
fi

number=$1
paddedNumber=$(printf "%02g" $1)

cd ~/Projects/chronik-der-wende/dvds/DVD-${paddedNumber}
for f in *.mp4;do ffmpeg -i "$f" -target pal-dvd -aspect 16:9 "${f%mp4}mpeg";done
cd ~/Projects/chronik-der-wende/assets
node ./build.js -d ${paddedNumber}
cd ~/Projects/chronik-der-wende/dvds/DVD-${paddedNumber}
mkdir assets
chmod 755 generate.sh && ./generate.sh
dvdauthor -x dvd.xml
mkisofs -R -V "DVD ${number} - Chronik der Wende" -dvd-video -o ../dvd-${paddedNumber}.iso out/
exit 0