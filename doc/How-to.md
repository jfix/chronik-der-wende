# How to 

## Software required

- rename
- ffmpeg (and ffprobe)
- imagemagick
- dvdauthor (and spumux)

## Get files and preparation

1. Get all video files from the Mediathek using MediathekView. There are 160 MP4 files, with an average size of 240 MB. There are also informative text files for each episode, containing useful metadata that will be used (hopefully) to add information to each episode in the DVD menu.
2. Rename all files so that they are in the right order, initially they they use DD.MM.YYYY which is unfortunate. I used the `rename` utility (via `brew install rename`):
 `$ rename 's/-Chronik_der_Wende_vom_([\d]{2})\.([\d]{2})\.([\d]{4})/_$3-$2-$1/g' * `
3. All episodes have to be converted to MPEG2 in order to be burnt on DVD. As I don't have enough space left on my hard disk, I will do one DVD at a time. One MP4 file of 232 MB will become an MPEG2 file of around 421 MB. So all data files will be moved into corresponding directories.
 ![DVD directories](./images/_directories_.png "Directory screenshot")
4. Compared to the input the basic `ffmpeg` conversion just using `-target pal-dvd` seems to produce very similar quality, at least I couldn't detect any difference.

## Convert to MPEG2

`ffmpeg -i input.mp4 -target pal-dvd -aspect 16:9 output.mpg`

The information of the input MP4 file looks like this (960x540px, 1992 kb/s bitrate):

```bash
ffprobe input.mp4 
ffprobe version 2.8.5 Copyright (c) 2007-2016 the FFmpeg developers
  built with Apple LLVM version 7.0.2 (clang-700.1.81)
  configuration: --prefix=/opt/local --enable-swscale --enable-avfilter --enable-avresample --enable-libmp3lame --enable-libvorbis --enable-libopus --enable-libtheora --enable-libschroedinger --enable-libopenjpeg --enable-libmodplug --enable-libvpx --enable-libsoxr --enable-libspeex --enable-libass --enable-libbluray --enable-lzma --enable-gnutls --enable-fontconfig --enable-libfreetype --enable-libfribidi --disable-indev=jack --disable-outdev=xv --mandir=/opt/local/share/man --enable-shared --enable-pthreads --cc=/usr/bin/clang --enable-vda --enable-videotoolbox --arch=x86_64 --enable-yasm --enable-gpl --enable-postproc --enable-libx264 --enable-libxvid --enable-nonfree --enable-libfdk-aac --enable-libfaac
  libavutil      54. 31.100 / 54. 31.100
  libavcodec     56. 60.100 / 56. 60.100
  libavformat    56. 40.101 / 56. 40.101
  libavdevice    56.  4.100 / 56.  4.100
  libavfilter     5. 40.101 /  5. 40.101
  libavresample   2.  1.  0 /  2.  1.  0
  libswscale      3.  1.101 /  3.  1.101
  libswresample   1.  2.101 /  1.  2.101
  libpostproc    53.  3.100 / 53.  3.100
Input #0, mov,mp4,m4a,3gp,3g2,mj2, from '../../chronic-der-wende-mpg/Chronik_der_Wende-Chronik_der_Wende_vom_30.11.1989-0819330755.mp4':
  Metadata:
    major_brand     : isom
    minor_version   : 512
    compatible_brands: isomiso2avc1mp41
    encoder         : Lavf58.32.104
  Duration: 00:14:09.45, start: 0.042667, bitrate: 2190 kb/s
    Stream #0:0(eng): Video: h264 (Main) (avc1 / 0x31637661), yuv420p, 960x540 [SAR 1:1 DAR 16:9], 1992 kb/s, 25 fps, 25 tbr, 12800 tbn, 50 tbc (default)
    Metadata:
      handler_name    : ?Mainconcept Video Media Handler
    Stream #0:1(eng): Audio: aac (LC) (mp4a / 0x6134706D), 48000 Hz, stereo, fltp, 192 kb/s (default)
    Metadata:
      handler_name    : #Mainconcept MP4 Sound Media Handler
```

The output MPEG2 file looks like this (720x576px, 3964 kb/s bitrate)

```bash
$ ffprobe output.mpg 
ffprobe version 2.8.5 Copyright (c) 2007-2016 the FFmpeg developers
  built with Apple LLVM version 7.0.2 (clang-700.1.81)
  configuration: --prefix=/opt/local --enable-swscale --enable-avfilter --enable-avresample --enable-libmp3lame --enable-libvorbis --enable-libopus --enable-libtheora --enable-libschroedinger --enable-libopenjpeg --enable-libmodplug --enable-libvpx --enable-libsoxr --enable-libspeex --enable-libass --enable-libbluray --enable-lzma --enable-gnutls --enable-fontconfig --enable-libfreetype --enable-libfribidi --disable-indev=jack --disable-outdev=xv --mandir=/opt/local/share/man --enable-shared --enable-pthreads --cc=/usr/bin/clang --enable-vda --enable-videotoolbox --arch=x86_64 --enable-yasm --enable-gpl --enable-postproc --enable-libx264 --enable-libxvid --enable-nonfree --enable-libfdk-aac --enable-libfaac
  libavutil      54. 31.100 / 54. 31.100
  libavcodec     56. 60.100 / 56. 60.100
  libavformat    56. 40.101 / 56. 40.101
  libavdevice    56.  4.100 / 56.  4.100
  libavfilter     5. 40.101 /  5. 40.101
  libavresample   2.  1.  0 /  2.  1.  0
  libswscale      3.  1.101 /  3.  1.101
  libswresample   1.  2.101 /  1.  2.101
  libpostproc    53.  3.100 / 53.  3.100
[NULL @ 0x7fc194811400] start time for stream 0 is not set in estimate_timings_from_pts
Input #0, mpeg, from '../../chronic-der-wende-mpg/output.mpg':
  Duration: 00:14:09.47, start: 0.534667, bitrate: 3964 kb/s
    Stream #0:0[0x1bf]: Data: dvd_nav_packet
    Stream #0:1[0x1e0]: Video: mpeg2video (Main), yuv420p(tv), 720x576 [SAR 64:45 DAR 16:9], max. 9000 kb/s, 25 fps, 25 tbr, 90k tbn, 50 tbc
    Stream #0:2[0x80]: Audio: ac3, 48000 Hz, stereo, fltp, 448 kb/s
Unsupported codec with id 1145979222 for input stream 0
```

There seem to be some problems with the start time for the stream 0. We'll see whether that causes issues.

The following line, executed inside a `DVD-xx` directory will convert all MP4 into MPEG2 files:

`for f in *.mp4;do ffmpeg -i "$f" -target pal-dvd -aspect 16:9 "${f%mp4}mpeg";done`

This line tells me how much space the ten episodes will take up:

```bash
~/Projects/chronik-der-wende/dvds/DVD-01 [master ↓·1|✔] 
$ find . -type f -name '*.mpeg' -exec du -ch {} + | grep total$
4.2G	total
```

Let's hope that's not too big for a DVD (it's really the limit and we don't have a DVD menu structure yet)

## DVD author


### Menu creation

Apparently, some audio (even silence) is required, as MP2 audio:

`$ ffmpeg -i 5-seconds-of-silence.mp3 menu-audio.mp2`

Convert an background image to video (`-t` is the number of seconds, not really important as it will loop anyway):

`$ ffmpeg -loop 1 -i assets/dvd-label.png -t 5 -aspect 16:9 -target pal-dvd assets/menu-video.mpg`

Merge the image and the sound:

`$ ffmpeg -i menu-audio.mp2 -i menu-video.mpeg -aspect 16:9 -target pal-dvd menu.mpg`



- read text files in DVDxx directory
- extract first and last date "7. bis 16. Oktober 1989"
- get DVD number "DVD 1"
- get all 10 dates in format "Samstag, 7. Okt." etc.

- create one image: "DVD xx           7. bis 16. Oktober 1989"
 - white on transparent, Futura 36px, normal width
- create 10 images for each date, Futura 30px, normal width, white
- create 10 images for each date, Futura 30px, normal width, white underlined
- create 10 images for each date, Futura 30px, normal width, red underlined

- annotate with ImageMagick the background template with the static centered DVD label
- create background mpeg from image + silence

- create menu XML for spumux with references for each button and its stage
- run spumux with mpeg of background to create mpeg with buttons

- bonus: create submenu from main menu with info and screenshot of each episode (use data from text file)


Create a transparent image of the background onto which to pose the buttons:

`$ convert -size 1048x576 xc:none PNG8:transparent-canvas.png`

