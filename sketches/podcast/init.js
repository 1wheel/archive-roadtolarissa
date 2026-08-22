window.init = function(){
  if (!window.episodes) return
  drawTours(window.episodes)
}

fetch('episodes.json')
  .then(r => r.json())
  .then(eps => {
    window.episodes = eps
    init()
  })
d3.select(window).on('resize.podtour', () => window.episodes && init())
