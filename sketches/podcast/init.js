window.init = function(){
  if (!window.episodes) return
  drawTours(window.episodes)
}

window.DATA_V = '20260921g'   // bump when episodes.json changes so browsers refetch
fetch('episodes.json?v=' + window.DATA_V)
  .then(r => r.json())
  .then(eps => {
    window.episodes = eps
    init()
  })
  .catch(e => d3.select('.c-tours .chart').text('could not load episodes.json'))
var rT, lastW = window.innerWidth
d3.select(window).on('resize.podtour', () => {
  if (window.innerWidth == lastW) return          // mobile scroll fires resize on height only
  lastW = window.innerWidth
  clearTimeout(rT); rT = setTimeout(() => window.episodes && init(), 150)
})
