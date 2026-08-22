window.init = function(){
  if (!window.episodes) return
  drawTours(window.episodes)
}

window.DATA_V = '20260822c'   // bump when episodes.json changes so browsers refetch
fetch('episodes.json?v=' + window.DATA_V)
  .then(r => r.json())
  .then(eps => {
    window.episodes = eps
    init()
  })
var rT
d3.select(window).on('resize.podtour', () => { clearTimeout(rT); rT = setTimeout(() => window.episodes && init(), 150) })
