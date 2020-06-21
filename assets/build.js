const fs = require('fs')
const glob = require('glob')
const path = require('path')
const moment = require('moment')
const rimraf = require('rimraf')
const parseArgs = require('minimist')

// parse cli arguments and look for -d for dvd number
let dvdNumber
const args = parseArgs(process.argv.slice(2))
if (!args.d || !(Number.isInteger(args.d)) || args.d > 17 || args.d < 1) {
    console.log(`Usage: ./assets/build.js -d [disk number from 1 to 17]\n`)
    process.exit(0)
}
dvdNumber = args.d

// console.log(`${dvdNumber.toString(10).padStart(2, '0')}`)
// process.exit(0)

// our dates are to be in German
moment.locale('de')

// define directories and files
const inDir = path.resolve(__dirname, `../dvds/DVD-${dvdNumber.toString(10).padStart(2, '0')}`)
const assetsInDir = `${inDir}/assets`
const assetsDir = __dirname
const outDir = inDir
const outFile = path.resolve(outDir, 'generate.sh')

// remove previous command file
rimraf.sync(outFile)
const stream = fs.createWriteStream(`${outFile}`, {flags:'a'});

// ---------------------------------------------------------
const cleanUp = () => {
    stream.write(`rm ${inDir}/assets/* && mkdir ${inDir}/assets\n`)
    stream.write(`rm ${inDir}/dvd.xml\n`)
}
const states = {
    'normal': 'white',
    'active': 'red',
    'selected': 'green'
}

// three transparent background images to merge with the episode background
const createGenericEpisodeBackground = () => {
    Object.keys(states).forEach((state) => {
        const colour = states[state]
        stream.write(`convert -background none -bordercolor ${colour} -border 2 -fill ${colour} -pointsize 20 label:" Zurück zum Menü " PNG8:${assetsInDir}/back-to-menu-${state}.png\n`)
        stream.write(`convert -background none -bordercolor ${colour} -border 2 -fill ${colour} -pointsize 20 label:" Episode abspielen " PNG8:${assetsInDir}/play-episode-${state}.png\n`)
        stream.write(`convert -size 720x576 xc:none ${assetsInDir}/back-to-menu-${state}.png -geometry +530+270 -composite ${assetsInDir}/play-episode-${state}.png -geometry +530+225 -composite PNG8:${assetsInDir}/episode-button-background-${state}.png\n`)
    })
}

const handleEpisode = (episodeId) => {
    // make an image of the episode text description file
    stream.write(`sed -n -e 1,10p -e 17,50p ${inDir}/${episodeId}.txt | convert -background black -size 680x -fill white -border 20 -bordercolor black -font Courier -pointsize 16 caption:@- ${assetsInDir}/${episodeId}-backdrop.png\n`)
    
    // add the "Chronik der Wende" logo to the top right corner
    stream.write(`convert ${assetsInDir}/${episodeId}-backdrop.png ${assetsDir}/episode-logo.png -geometry +540+20 -composite ${assetsInDir}/${episodeId}-description.png\n`)
    
    // take the image and convert it to a video
    stream.write(`ffmpeg -loglevel warning -hide_banner -y -loop 1 -i ${assetsInDir}/${episodeId}-description.png -t 5 -aspect 16:9 -target pal-dvd ${assetsInDir}/${episodeId}-menu1.mpeg\n`)
    // add silent audio to the video
    stream.write(`ffmpeg -loglevel warning -hide_banner -y -i ${assetsDir}/menu-audio.mp2 -i ${assetsInDir}/${episodeId}-menu1.mpeg -aspect 16:9 -target pal-dvd ${assetsInDir}/${episodeId}-menu2.mpeg\n`)
    // mux 
    stream.write(`spumux ${assetsDir}/episode-button-template.xml < ${assetsInDir}/${episodeId}-menu2.mpeg > ${assetsInDir}/${episodeId}-menu.mpeg\n`)

    return `<titleset><menus><pgc><button>jump title 1;</button><button>jump vmgm menu 1;</button><vob file="assets/${episodeId}-menu.mpeg" pause="inf"/></pgc></menus><titles><pgc><post>call menu;</post><vob file="${episodeId}.mpeg"/></pgc></titles></titleset>`
}
// ---------------------------------------------------------

const readFiles = (e, files) => {
    let firstDate, lastDate, currentDate, titlesets = ''

    cleanUp()
    createGenericEpisodeBackground()
    stream.write(`export VIDEO_FORMAT=PAL\n`)

    files.forEach((f, i) => {
        const episodeId = path.basename(f, '.mpeg')     
        console.log(`==> ${episodeId}`)
        const date = moment(episodeId.match(/_(\d{4}-\d{2}-\d{2})-/)[1])
        if (i === 0) firstDate = date.format('D. MMMM')
        currentDate = date.format('dddd, D. MMM')

        Object.keys(states).forEach((state) => {
            const colour = states[state]
            stream.write(`convert -background none -bordercolor ${colour} -border 2 -fill ${colour} -pointsize 20 label:" ${currentDate} " PNG8:${assetsInDir}/button-${state}-${i+1}.png\n`)
        })
        
        if (i + 1 === files.length) {
            lastDate = date.format('D. MMMM YYYY')
            stream.write(`convert ${assetsDir}/bg-template.png -pointsize 30 -draw "gravity south fill white text 0,90 'DVD ${dvdNumber}      ${firstDate} bis ${lastDate}'" PNG8:${assetsInDir}/dvd-label.png\n`)
        }
        titlesets += handleEpisode(episodeId, i)

    })
    stream.write(`cp ${assetsDir}/dvd-template.xml ${inDir}/dvd.xml\n`)
    stream.write(`sed -i '' -e 's#TITLESETS#${titlesets}#' ${inDir}/dvd.xml\n`)


    const buttonPositionString = (assetsInDir, state) => {
        const buttonPositions = [ "+40+80", "+40+130", "+40+185", "+40+240", "+40+295", "+510+80", "+510+130", "+510+185", "+510+240", "+510+295" ]
        let string = ""
        files.forEach((f, i) => {
            string += `${assetsInDir}/button-${state}-${(i+1)}.png -geometry ${buttonPositions[i]} -composite `
        })
        return string
    }

    Object.keys(states).forEach((state) => {
        stream.write(`convert -size 720x576 xc:none ${buttonPositionString(assetsInDir, state)} PNG8:${assetsInDir}/background-${state}.png\n`)
    })

    stream.write(`ffmpeg -loglevel warning -hide_banner -y -loop 1 -i assets/dvd-label.png -t 5 -aspect 16:9 -target pal-dvd assets/menu-video.mpeg\n`)
    stream.write(`ffmpeg -loglevel warning -hide_banner -y -i ${assetsDir}/menu-audio.mp2 -i assets/menu-video.mpeg -aspect 16:9 -target pal-dvd assets/menu.mpeg\n`)
    stream.write(`export VIDEO_FORMAT=PAL\n`)
    stream.write(`spumux ${assetsDir}/menu-buttons-template.xml < assets/menu.mpeg > assets/menu-final.mpeg\n`)
    stream.write(`\n\necho 'Now run: dvdauthor -x dvd.xml'\n\n`)
}

glob(`${inDir}/*.mpeg`, {}, readFiles)

