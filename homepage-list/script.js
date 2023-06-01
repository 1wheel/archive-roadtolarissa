var {jp, d3, _, request, fs, io, glob, exe} = require('scrape-stl')

var {execSync} = require('child_process')
var sharp = require('sharp')

function updateProjects(){
  d3.csv('https://www.googleapis.com/drive/v3/files/1xUvK5PGo8XPqARJIvXRnn71lJSL8CwjvjUWB9Jcy0Ho/export?mimeType=text/csv&key=AIzaSyAT-ALGW_bcmcvNs1dPgcV7fF6tR1vKY44', (err, res) => {
    if (err) console.log(err, res)

    io.writeDataSync(__dirname + '/projects.csv', res)
  })
}
updateProjects()


var rawImgPath = __dirname + '/raw-img/'
var thumbImgPath =  __dirname + '/thumb-img/'

var projects = io.readDataSync(__dirname + '/projects.csv')

projects.forEach(d => {
  d.rawPath = rawImgPath + d.slug + '.' + _.last(d.img.split('.'))
  d.thumbPath = thumbImgPath + d.slug + '.jpg'

  d.img = d.img
    .replace('/images/thumbnails', 'https://roadtolarissa.com/images/thumbnails')
    .replace('http://', 'https://')
})

function dlImages(){
  var existingImages = glob.sync(rawImgPath + '*.*')

  var isExisting = {}
  existingImages.forEach(d => isExisting[d.split('/').slice(-1)[0].split('.')[0]] = true)

  projects.forEach(d => {
    if (isExisting[d.slug]) return
    console.log(d)
    execSync(`curl ${d.img} > ${d.rawPath}`)
  })
}
dlImages()


function resizeImages(){
  projects.forEach(d => {
    sharp(d.rawPath)
      // .resize({width: 200, height: 100, position: sharp.strategy.entropy})
      .resize({width: 200, height: 100, })
      .jpeg({quality: 100})
      .flatten({background: {r: 255, g: 255, b: 255}})
      .toFile(d.thumbPath, err => err ? console.log({d, err}) : '')
  })
}
resizeImages()



