const fs = require('fs')
const glob = require('glob')
const path = require('path')
const moment = require('moment')
const rimraf = require('rimraf')

moment.locale('de')

const dvdNumber = '1'
const inDir = path.resolve(__dirname, `../dvds/DVD-${dvdNumber.padStart(2, '0')}`)
const assetsDir = __dirname
const outDir = inDir
const outFile = path.resolve(outDir, 'generate.sh')

rimraf.sync(outFile)
const stream = fs.createWriteStream(`${outFile}`, {flags:'a'});

// ---------------------------------------------------------
const cleanUp = () => {
    stream.write(`rm ${inDir}/assets/*\n`)
    stream.write(`rm ${inDir}/dvd.xml\n`)
}

// ---------------------------------------------------------

const readFiles = (e, files) => {
    let firstDate, lastDate, currentDate, titlesets = ''

    cleanUp()

    files.forEach((f, i) => {

        const filename = path.basename(f)
        console.log(`==> ${filename}`)
        const date = moment(filename.match(/_(\d{4}-\d{2}-\d{2})-/)[1])
        if (i === 0) firstDate = date.format('D. MMMM')
        currentDate = date.format('dddd, D. MMM')

        stream.write(`convert -background none -bordercolor white -border 2 -fill white -pointsize 20 label:"${currentDate}" PNG8:${inDir}/assets/button-normal-${i+1}.png\n`)
        stream.write(`convert -background none -bordercolor green -border 2 -fill green -pointsize 20 label:"${currentDate}" PNG8:${inDir}/assets/button-active-${i+1}.png\n`)
        stream.write(`convert -background none -bordercolor red -border 2 -fill red -pointsize 20 label:"${currentDate}" PNG8:${inDir}/assets/button-selected-${i+1}.png\n`)

        // TODO: create images then videos from the text files
        //  sed -n -e 1,10p -e 17,50p dvds/DVD-01/Chronik_der_Wende_1989-10-07-1097577097.txt |convert -background blue -size 680x -fill white -border 20 -bordercolor blue -font Courier -pointsize 16 caption:@- test.png

        if (i + 1 === files.length) {
            lastDate = date.format('D. MMMM YYYY')
            stream.write(`convert ${assetsDir}/bg-template.png -pointsize 30 -draw "gravity south fill white text 0,90 'DVD ${dvdNumber}      ${firstDate} bis ${lastDate}'" PNG8:${inDir}/assets/dvd-label.png\n`)
        }
        const titleset = `<titleset><titles><pgc><post>call vmgm menu 1;</post><vob file="${filename}"/></pgc></titles></titleset>`
        titlesets += titleset
    })
    
    stream.write(`cp ${assetsDir}/dvd-template.xml ${inDir}/dvd.xml\n`)
    stream.write(`sed -i '' -e 's#TITLESETS#${titlesets}#' ${inDir}/dvd.xml\n`)

    stream.write(`convert -size 720x576 xc:none assets/button-normal-1.png -geometry +40+80 -composite assets/button-normal-2.png -geometry +40+130 -composite assets/button-normal-3.png -geometry +40+185 -composite assets/button-normal-4.png -geometry +40+240 -composite assets/button-normal-5.png -geometry +40+295 -composite assets/button-normal-6.png -geometry +510+80 -composite assets/button-normal-7.png -geometry +510+130 -composite assets/button-normal-8.png -geometry +510+185 -composite assets/button-normal-9.png -geometry +510+240 -composite assets/button-normal-10.png -geometry +510+295 -composite PNG8:assets/background-normal.png\n`)

    stream.write(`convert -size 720x576 xc:none assets/button-active-1.png -geometry +40+80 -composite assets/button-active-2.png -geometry +40+130 -composite assets/button-active-3.png -geometry +40+185 -composite assets/button-active-4.png -geometry +40+240 -composite assets/button-active-5.png -geometry +40+295 -composite assets/button-active-6.png -geometry +510+80 -composite assets/button-active-7.png -geometry +510+130 -composite assets/button-active-8.png -geometry +510+185 -composite assets/button-active-9.png -geometry +510+240 -composite assets/button-active-10.png -geometry +510+295 -composite PNG8:assets/background-active.png\n`)

    stream.write(`convert -size 720x576 xc:none assets/button-selected-1.png -geometry +40+80 -composite assets/button-selected-2.png -geometry +40+130 -composite assets/button-selected-3.png -geometry +40+185 -composite assets/button-selected-4.png -geometry +40+240 -composite assets/button-selected-5.png -geometry +40+295 -composite assets/button-selected-6.png -geometry +510+80 -composite assets/button-selected-7.png -geometry +510+130 -composite assets/button-selected-8.png -geometry +510+185 -composite assets/button-selected-9.png -geometry +510+240 -composite assets/button-selected-10.png -geometry +510+295 -composite PNG8:assets/background-selected.png\n`)

    stream.write(`ffmpeg -y -loop 1 -i assets/dvd-label.png -t 5 -aspect 16:9 -target pal-dvd assets/menu-video.mpeg\n`)
    stream.write(`ffmpeg -y -i ${assetsDir}/menu-audio.mp2 -i assets/menu-video.mpeg -aspect 16:9 -target pal-dvd assets/menu.mpeg\n`)
    stream.write(`export VIDEO_FORMAT=PAL\n`)
    stream.write(`spumux ${assetsDir}/menu-buttons-template.xml < assets/menu.mpeg > assets/menu-final.mpeg`)
}

glob(`${inDir}/*.mpeg`, {}, readFiles)

