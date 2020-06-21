#!/bin/bash

if [ $# -ne 1 ]; then
    echo usage: $0 number
    exit 1
fi

cwd=$(pwd)

number=$1
paddedNumber=$(printf "%02g" $1)

previousNumber="$(($number - 1))"
previouPaddedNumber=$(printf "%02g" $previousNumber)

cd ${cwd}
rm -f dvd-"$previousPaddedNumber".iso
rm -rf dvds/DVD-"$previousPaddedNumber"/out
rm -f dvds/DVD-"$previousPaddedNumber"/*.mpeg

cd ${cwd}/dvds/DVD-${paddedNumber}
for f in *.mp4;do ffmpeg -i "$f" -target pal-dvd -aspect 16:9 "${f%mp4}mpeg";done
cd ${cwd}/assets
node ./build.js -d ${paddedNumber}
cd ${cwd}/dvds/DVD-${paddedNumber}
mkdir assets
chmod 755 generate.sh && ./generate.sh
dvdauthor -x dvd.xml
mkisofs -R -V "DVD ${number} - Chronik der Wende" -dvd-video -o ${cwd}/dvd-${paddedNumber}.iso out/
tput bel;tput bel;tput bel
exit 0