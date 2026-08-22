// One dot per episode across fifteen shows / nine host rows, 2014-2026.
// A guest extracted from 2+ hosts' shows within `window.tourWindow` days is a
// "press tour": dots go bold (blue = 2 hosts, red = 3+), tour episodes get
// linked on hover/pin. Guest names come from feed-text regexes, so treat them
// as best-effort (and as untrusted strings: everything lands in the DOM
// escaped or via .text()).
window.drawTours = function(eps){
  var C = {base: '#a9b2bd', two: '#3e6fa8', three: '#d1495b', ink: '#1d3557'}

  var SHOWS = {
    'ek-vox':       {label: 'EK Show · Vox',  short: 'Vox',       host: 'Ezra Klein'},
    'impeachment':  {label: 'Impeachment',    short: 'Imp.',      host: 'Ezra Klein'},
    'ek-nyt':       {label: 'EK Show · NYT',  short: 'NYT',       host: 'Ezra Klein'},
    'crazy-genius': {label: 'Crazy/Genius',   short: 'C/G',       host: 'Derek Thompson'},
    'plain-english':{label: 'Plain English',  short: 'Plain E.',  host: 'Derek Thompson'},
    'odd-lots':     {label: 'Odd Lots',       short: 'Odd Lots',  host: 'Joe Weisenthal & Tracy Alloway'},
    '538-politics': {label: '538 Politics',   short: '538',       host: 'Nate Silver'},
    'risky-biz':    {label: 'Risky Business', short: 'Risky B.',  host: 'Nate Silver'},
    'reply-all':    {label: 'Reply All',      short: 'Reply All', host: 'PJ Vogt'},
    'crypto-island':{label: 'Crypto Island',  short: 'Crypto I.', host: 'PJ Vogt'},
    'search-engine':{label: 'Search Engine',  short: 'Search E.', host: 'PJ Vogt'},
    'hard-fork':    {label: 'Hard Fork',      short: 'Hard Fork', host: 'Kevin Roose & Casey Newton'},
    'decoder':      {label: 'Decoder',        short: 'Decoder',   host: 'Nilay Patel'},
    'tyler':        {label: 'Conv. w/ Tyler', short: 'CwT',       host: 'Tyler Cowen'},
    'dwarkesh':     {label: 'Dwarkesh Pod',   short: 'Dwarkesh',  host: 'Dwarkesh Patel'},
    'fresh-air':    {label: 'Fresh Air',      short: 'Fresh Air', host: 'Terry Gross'},
    'tal':          {label: 'This American Life', short: 'TAL',   host: 'Ira Glass'},
  }
  var ROWS = [
    {host: 'Ezra Klein',                       lanes: ['ek-vox', 'impeachment', 'ek-nyt']},
    {host: 'Derek Thompson',                   lanes: ['crazy-genius', 'plain-english']},
    {host: 'Joe Weisenthal & Tracy Alloway',   lanes: ['odd-lots']},
    {host: 'Nate Silver',                      lanes: ['538-politics', 'risky-biz']},
    {host: 'PJ Vogt',                          lanes: ['reply-all', 'crypto-island', 'search-engine']},
    {host: 'Kevin Roose & Casey Newton',       lanes: ['hard-fork']},
    {host: 'Nilay Patel',                      lanes: ['decoder']},
    {host: 'Tyler Cowen',                      lanes: ['tyler']},
    {host: 'Dwarkesh Patel',                   lanes: ['dwarkesh']},
    {host: 'Terry Gross',                      lanes: ['fresh-air']},
    {host: 'Ira Glass',                        lanes: ['tal']},
  ]

  // ---- layout ----
  var chartSel = d3.select('.c-tours .chart').html('').st({position: 'relative'})
  window.ttSel = chartSel.selectAppend('div.tooltip.tooltip-hidden')
  var measured = chartSel.node().getBoundingClientRect().width || window.innerWidth
  var availWidth = Math.min(measured, document.documentElement.clientWidth - 10)
  var isMobile = availWidth < 640
  var margin = {top: 18, right: 14, bottom: 30, left: isMobile ? 58 : 96}

  var laneH = {}, laneY = {}, y = 0
  ROWS.forEach(row => {
    y += 20  // host label
    row.labelY = y - 6
    row.lanes.forEach(s => {
      laneH[s] = (s == 'odd-lots' || s == 'fresh-air') ? 46 : 24
      laneY[s] = y + laneH[s]/2
      y += laneH[s] + 5
    })
    y += 14
  })
  var height = y - 14

  var c = d3.conventions({
    sel: chartSel,
    totalWidth: Math.min(availWidth, 940),
    height: height,
    margin: margin,
  })

  eps.forEach(d => d.date = d.date || new Date(d.d + 'T12:00:00Z'))
  var maxDate = d3.max(eps, d => d.date)
  c.x = d3.scaleUtc()
    .domain([new Date('2014-10-01'), new Date(+maxDate + 1000*60*60*24*45)])
    .range([0, c.width])
  c.svg.append('g').attr('class', 'x axis')
    .translate(c.height + 4, 1)
    .call(d3.axisBottom(c.x).ticks(isMobile ? 6 : 10).tickSize(-c.height - 4))

  // deterministic jitter so dots don't dance on redraw/resize
  function hash(s){
    var h = 0
    for (var i = 0; i < s.length; i++) h = (h*31 + s.charCodeAt(i)) % 1000003
    return h/1000003*2 - 1
  }
  eps.forEach(d => {
    d.px = c.x(d.date)
    d.py = laneY[d.s] + hash(d.t)*(laneH[d.s]/2 - 4)
  })

  // ---- row + lane chrome ----
  ROWS.forEach(row => {
    c.svg.append('text.host-label').at({x: isMobile ? -margin.left + 2 : -margin.left + 4, y: row.labelY})
      .text(!isMobile ? row.host : row.host
        .replace('Joe Weisenthal & Tracy Alloway', 'Joe & Tracy · Odd Lots')
        .replace('Kevin Roose & Casey Newton', 'Roose & Newton · Hard Fork'))
    row.lanes.forEach(s => {
      c.svg.append('line.lane-line').at({x1: 0, x2: c.width, y1: laneY[s], y2: laneY[s]})
      c.svg.append('text.lane-label').at({x: -8, y: laneY[s] + 3, textAnchor: 'end'})
        .text(isMobile ? SHOWS[s].short : SHOWS[s].label)
    })
  })

  // ---- guest → tour computation ----
  // key folds diacritics + middle initials so Žižek == Zizek, Peter R. Orszag == Peter Orszag
  function guestKey(g){
    var p = g.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\./g, '').toLowerCase().split(/\s+/)
    return p[0] + '|' + p[p.length - 1]
  }
  var byGuest = {}, guestMeta = {}
  eps.forEach(d => (d.g || []).forEach(g => {
    var k = guestKey(g)
    ;(byGuest[k] = byGuest[k] || []).push(d)
  }))
  Object.keys(byGuest).forEach(k => {
    var list = byGuest[k].sort((a, b) => a.date - b.date)
    var name = ''
    list.forEach(d => d.g.forEach(g => { if (guestKey(g) == k && g.length > name.length) name = g }))
    guestMeta[k] = {key: k, name, eps: list, nShows: d3.nestBy(list, d => d.s).length}
  })

  var tours = []
  function computeTours(W){
    tours = []
    eps.forEach(d => { d.tour = null; d.tier = 0 })
    Object.keys(byGuest).forEach(k => {
      var list = byGuest[k].slice().sort((a, b) => a.date - b.date)
      var cluster = [list[0]]
      var flush = () => {
        var hosts = d3.nestBy(cluster, d => SHOWS[d.s].host)
        if (hosts.length >= 2){
          var name = ''
          cluster.forEach(d => d.g.forEach(g => {
            if (guestKey(g) == k && g.length > name.length) name = g
          }))
          var tour = {key: k, name, eps: cluster, nHosts: hosts.length, last: cluster[cluster.length - 1].date}
          tours.push(tour)
          cluster.forEach(d => {
            if (!d.tour || tour.nHosts > d.tour.nHosts) { d.tour = tour; d.tier = hosts.length >= 3 ? 3 : 2 }
          })
        }
      }
      for (var i = 1; i < list.length; i++){
        if ((list[i].date - list[i-1].date)/864e5 <= W) cluster.push(list[i])
        else { flush(); cluster = [list[i]] }
      }
      flush()
    })
    tours.sort((a, b) => (b.nHosts - a.nHosts) || (b.last - a.last))
  }

  // ---- dots ----
  var dotSel = c.svg.appendMany('circle.ep', eps)
    .translate(d => [d.px, d.py])

  var linkG = c.svg.append('g')       // always-on links for 3+ host tours
  var hiG = c.svg.append('g').st({pointerEvents: 'none'})  // hover/pin overlay
  var annG = c.svg.append('g').st({pointerEvents: 'none'})

  var line = d3.line().x(d => d.px).y(d => d.py).curve(d3.curveMonotoneY)
  function tourPath(tour){ return line(tour.eps.slice().sort((a, b) => a.py - b.py || a.px - b.px)) }

  function restyle(){
    dotSel
      .at({r: d => d.tier == 3 ? 4 : d.tier == 2 ? 3.4 : 2})
      .st({
        fill: d => d.tier == 3 ? C.three : d.tier == 2 ? C.two : C.base,
        fillOpacity: d => d.tier ? .95 : .55,
        stroke: d => d.tier ? '#fff' : 'none',
        strokeWidth: .6,
      })
    dotSel.filter(d => d.tier).raise()

    linkG.html('')
    linkG.appendMany('path', tours.filter(t => t.nHosts >= 3))
      .at({d: tourPath, fill: 'none', stroke: C.three, strokeWidth: 1, opacity: .25})
  }

  // ---- highlight a guest: every appearance ever + links on their tour clusters ----
  var pinned = null   // guest key
  function highlight(key){
    hiG.html('')
    annG.st({opacity: key == 'jasmine|sun' ? 0 : 1})
    var gm = key && guestMeta[key]
    if (!gm) return
    var gTours = tours.filter(t => t.key == key)
    var color = gTours.some(t => t.nHosts >= 3) ? C.three : gTours.length ? C.two : C.ink
    gTours.forEach(t => {
      hiG.append('path').at({d: tourPath(t), fill: 'none', stroke: color, strokeWidth: 1.6, opacity: .8})
    })
    hiG.appendMany('circle', gm.eps)
      .translate(d => [d.px, d.py])
      .at({r: 6.5, fill: 'none', stroke: color, strokeWidth: 1.6})
    var top = gm.eps.slice().sort((a, b) => a.py - b.py || b.px - a.px)[0]
    var label = gm.name + ' · ' + gm.eps.length + ' appearance' + (gm.eps.length > 1 ? 's' : '')
      + (gm.nShows > 1 ? ' on ' + gm.nShows + ' shows' : '')
    hiG.append('text.hover-name')
      .translate([Math.min(Math.max(top.px, 60), c.width - 10), top.py - 12])
      .at({textAnchor: top.px > c.width*.75 ? 'end' : 'middle'})
      .text(label)
  }

  // ---- annotation: the Jasmine Sun blitz ----
  function drawAnnotation(){
    annG.html('')
    var tour = tours.filter(t => t.key == 'jasmine|sun' && +t.last > +new Date('2026-07-01'))[0]
    if (!tour || isMobile) return
    var top = tour.eps.slice().sort((a, b) => a.py - b.py)[0]
    var tx = top.px - 130, ty = top.py - 20
    var t = annG.append('text.annotation').at({textAnchor: 'end'})
    t.append('tspan').at({x: tx, y: ty}).text('Jasmine Sun, ' + tour.eps.length + ' shows in ' +
      Math.round((d3.max(tour.eps, d => d.date) - d3.min(tour.eps, d => d.date))/864e5) + ' days —')
    t.append('tspan.light').at({x: tx, y: ty + 14}).text('Nate did his interview in print')
    annG.append('path').at({
      d: 'M ' + (tx + 4) + ' ' + (ty - 4) + ' Q ' + (top.px - 12) + ' ' + (ty - 10) + ' ' + (top.px - 5) + ' ' + (top.py - 5),
      fill: 'none', stroke: '#999', strokeWidth: 1,
    })
  }

  // ---- chips ----
  var chipSel = d3.select('.c-tours .chips')
  function drawChips(){
    chipSel.html('')
    chipSel.append('span').text('Biggest tours: ')
    var top = tours.filter(t => t.nHosts >= 3).slice(0, 12)
    if (top.length < 8) top = tours.slice(0, 12)
    chipSel.appendMany('button', top)
      .classed('on', t => pinned == t.key)
      .on('click', t => {
        pinned = pinned == t.key ? null : t.key
        d3.select('.c-tours .guest-search').property('value', pinned ? guestMeta[pinned].name : '')
        highlight(pinned)
        drawChips()
      })
      .html('')
      .each(function(t){
        var b = d3.select(this)
        b.append('b').text(t.name)
        b.append('span.n').text(t.nHosts + ' hosts · ' + t.eps.length + ' eps')
      })
  }

  // ---- small multiples: every 3+ host blitz, zoomed to its window ----
  var multSel = d3.select('.c-tours .multiples')
  var fmtShort = d3.utcFormat('%b %-d'), fmtYr = d3.utcFormat('%b %Y')
  function drawMultiples(){
    multSel.html('')
    var big = tours.filter(t => t.nHosts >= 3).sort((a, b) => b.last - a.last)
    if (!big.length) return
    multSel.append('div.mult-head').text('The blitzes — every guest hitting 3+ hosts inside the window')
    var cards = multSel.appendMany('div.mult-card', big)
      .classed('on', t => pinned == t.key)
      .on('click', t => {
        pinned = pinned == t.key ? null : t.key
        d3.select('.c-tours .guest-search').property('value', pinned ? guestMeta[t.key].name : '')
        highlight(pinned)
        drawChips()
        drawMultiples()
      })
    cards.each(function(t){
      var sel = d3.select(this)
      var eps = t.eps.slice().sort((a, b) => a.date - b.date)
      var days = Math.max(1, Math.round((+eps[eps.length-1].date - +eps[0].date)/864e5))
      sel.append('div.mult-name').text(t.name)
      sel.append('div.mult-sub').text(t.nHosts + ' hosts · ' + days + ' days · ' + fmtYr(t.last))
      var W = 208, rowH = 18, padT = 6, padB = 20, tlL = 6, tlR = 88
      var H = padT + eps.length*rowH + padB
      var svg = sel.append('svg').at({width: W, height: H})
      var x = d3.scaleUtc()
        .domain([+eps[0].date - 2.5*864e5, +eps[eps.length-1].date + 2.5*864e5])
        .range([tlL + 4, W - tlR - 6])
      // connecting path through dots
      var pts = eps.map((d, i) => [x(d.date), padT + i*rowH + rowH/2])
      svg.append('path').at({
        d: 'M' + pts.map(p => p.join(' ')).join(' L '),
        fill: 'none', stroke: C.three, strokeWidth: 1.2, opacity: .45,
      })
      eps.forEach((d, i) => {
        var yy = padT + i*rowH + rowH/2
        svg.append('line').at({x1: tlL, x2: W - tlR, y1: yy, y2: yy, stroke: '#f1f1f1'})
        svg.append('circle').at({cx: x(d.date), cy: yy, r: 4.5, fill: C.three, stroke: '#fff', strokeWidth: 1})
        svg.append('text.mult-show').at({x: W - tlR + 4, y: yy + 3})
          .text(SHOWS[d.s].short + ' · ' + fmtShort(d.date))
      })
      svg.append('text.mult-axis').at({x: tlL, y: H - 5}).text(fmtShort(eps[0].date))
      svg.append('text.mult-axis').at({x: W - tlR, y: H - 5, textAnchor: 'end'})
        .text(days > 0 ? fmtShort(eps[eps.length-1].date) : '')
    })
  }

  // ---- tooltip + nearest-point hover ----
  var fmt = d3.utcFormat('%b %-d, %Y')
  var esc = s => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  c.svg.append('rect').at({width: c.width, height: c.height, opacity: 0})
  c.svg
    .on('mousemove', function(){
      var [mx, my] = d3.mouse(this)
      var best = null, bestD = 26*26
      eps.forEach(d => {
        var dx = d.px - mx, dy = d.py - my, dd = dx*dx + dy*dy
        if (dd < bestD){ bestD = dd; best = d }
      })
      if (!best){ hideTip(); return }
      highlight(best.g && best.g.length ? guestKey(best.g[0]) : pinned)
      var html = "<div class='tt-show'>" + esc(SHOWS[best.s].label) + ' · ' + esc(SHOWS[best.s].host) + '</div>'
        + "<div class='tt-title'>" + esc(best.t) + '</div>'
        + '<div>' + fmt(best.date)
        + (best.g && best.g.length ? " · <span class='tt-guest'>" + esc(best.g.join(', ')) + '</span>' : '')
        + '</div>'
        + (best.x ? "<div class='tt-desc'>" + esc(best.x) + '</div>' : '')
        + (best.tour ? "<div class='tt-tour'><b>" + esc(best.tour.name) + "</b> hit " + best.tour.nHosts
          + " hosts' shows in " + Math.max(1, Math.round((d3.max(best.tour.eps, d => d.date) - d3.min(best.tour.eps, d => d.date))/864e5)) + ' days</div>' : '')
        + (best.u ? "<div class='tt-open'>click to open episode ↗</div>" : '')
      window.ttSel.classed('tooltip-hidden', false).html(html)
      var node = chartSel.node().getBoundingClientRect()
      var left = Math.min(Math.max(4, mx + margin.left + 14), node.width - 310)
      window.ttSel.st({left: left + 'px', top: (my + margin.top + 18) + 'px'})
    })
    .on('mouseleave', hideTip)
    .on('click', function(){
      var [mx, my] = d3.mouse(this)
      var best = null, bestD = 26*26
      eps.forEach(d => {
        var dx = d.px - mx, dy = d.py - my, dd = dx*dx + dy*dy
        if (dd < bestD){ bestD = dd; best = d }
      })
      if (best && best.u) window.open(best.u, '_blank')
    })
  function hideTip(){
    window.ttSel.classed('tooltip-hidden', true)
    highlight(pinned)
  }

  // ---- window slider ----
  var countSel = d3.select('.c-tours .tour-count')
  function recompute(W){
    computeTours(W)
    restyle()
    drawChips()
    drawMultiples()
    drawAnnotation()
    highlight(pinned)
    countSel.text(tours.length + ' tours · ' + eps.filter(d => d.tier).length + ' episodes bolded')
  }
  // ---- guest search (find every appearance, ever) ----
  var names = Object.values(guestMeta).sort((a, b) => b.eps.length - a.eps.length)
  d3.select('#guest-list').html('')
    .appendMany('option', names.slice(0, 2500))
    .at({value: d => d.name})
  function fold(s){ return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() }
  d3.select('.c-tours .guest-search')
    .on('input change', function(){
      var q = fold(this.value)
      if (!q){ pinned = null; highlight(null); drawChips(); return }
      var hit = names.filter(g => fold(g.name) == q)[0] ||
                (q.length > 2 ? names.filter(g => fold(g.name).includes(q))[0] : null)
      if (hit){ pinned = hit.key; highlight(pinned); drawChips() }
    })

  d3.select('.c-tours .win-slider')
    .on('input', function(){
      window.tourWindow = +this.value
      d3.select('.c-tours .win-days').text(this.value)
      recompute(window.tourWindow)
    })
    .property('value', window.tourWindow = window.tourWindow || 30)
  d3.select('.c-tours .win-days').text(window.tourWindow)

  recompute(window.tourWindow)
}
