var {_, d3, jp, fs, glob, io} = require('scrape-stl')
var ss = require('simple-statistics')


var stateStrs = ["AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","HI","IA","ID","IL","IN","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VA","VT","WA","WI","WV","WY"]


function parse538(){
  var {states, maps} = io.readDataSync(__dirname + '/raw-538.json')

  states = states
    .map((str, i) => {
      if (str.includes(1) || str.includes(2) || str.includes(3)) return null
      return {str, originalIndex: i}
    })
    .filter(d => d)
  states.forEach((d, i) => d.outIndex = i)

  var out = new Int16Array(maps.length*states.length)

  maps.forEach((map, i) => {
    states.forEach(state => {
      out[i*states.length + state.outIndex] = (100 + map[state.originalIndex + 3])*100/2
    })
  })

  fs.writeFileSync(__dirname + '/maps-538.buf', out)
  console.log(d3.extent(out))
}
// parse538()

function parseEcon(){
  var maps = io.readDataSync(__dirname + '/raw-eco.csv')
  var out = new Int16Array(maps.length*stateStrs.length)

  console.log(maps[0])

  maps.forEach((map, i) => {
    stateStrs.forEach((str, j) => {
      out[i*stateStrs.length + j] = Math.round((1 - map[str])*10000)
    })
  })

  fs.writeFileSync(__dirname + '/maps-eco.buf', out)
  console.log(d3.extent(out))
}
// parseEcon()





function calc(model){
  var nStates = stateStrs.length
  var nSims = 40000
  
  var data = new Int16Array(fs.readFileSync(__dirname + `/maps-${model}.buf`).buffer)
  var states = stateStrs.map((str, stateIndex) => {
    var trumpShare = d3.range(nSims).map(i => data[i*nStates + stateIndex])

    return {str, stateIndex, trumpShare}
  })

  var pairs = d3.cross(states, states)
    .map(([a, b]) => {
      var strA = a.str
      var indexA = a.stateIndex
      var strB = b.str
      var indexB = b.stateIndex

      // if (indexB <= indexA) return

      var cor = ss.sampleCorrelation(a.trumpShare, b.trumpShare)

      var lineData = a.trumpShare.map((d, i) => [d, b.trumpShare[i]])
      var {b, m} = ss.linearRegression(lineData)

      return {indexA, strA, indexB, strB, cor, b, m}
    })
    .filter(d => d)

  io.writeDataSync(__dirname + `/pairs-${model}.json`, pairs)
}

calc('538')
calc('eco')
