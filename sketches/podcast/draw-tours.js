// One dot per episode across 18 shows / 11 host rows, 2014-2026.
// A guest extracted from 2+ hosts' shows within `window.tourWindow` days is a
// "press tour": dots go bold (blue = 2 hosts, red = 3+), tour episodes get
// linked on hover/pin. Guest names come from feed-text regexes, so treat them
// as best-effort (and as untrusted strings: everything lands in the DOM
// escaped or via .text()).
window.drawTours = function(eps){
  var C = {base: '#1f1f1f', two: '#3e6fa8', three: '#d1495b', ink: '#1d3557', sel: '#e0218a'}
  var RUN = ['#b92d3c', '#2f6db5', '#d39a14', '#1e9e8a']   // one per 3+ host run (validated, fixed order); extras fold to neutral
  var runColor = t => t && t.ci < RUN.length ? RUN[t.ci] : '#555'

  var SHOWS = {
    'ek-vox':       {label: 'EK Show · Vox',  short: 'Vox',       host: 'Ezra Klein'},
    'impeachment':  {label: 'Impeachment',    short: 'Imp.',      host: 'Ezra Klein'},
    'ek-nyt':       {label: 'EK Show · NYT',  short: 'NYT',       host: 'Ezra Klein'},
    'crazy-genius': {label: 'Crazy/Genius',   short: 'C/G',       host: 'Derek Thompson'},
    'plain-english':{label: 'Plain English',  short: 'Plain E.',  host: 'Derek Thompson'},
    'odd-lots':     {label: 'Odd Lots',       short: 'Odd Lots',  host: 'Joe Weisenthal & Tracy Alloway'},
    '538-politics': {label: '538 Politics',   short: '538',       host: 'Nate Silver'},
    'risky-biz':    {label: 'Risky Business', short: 'Risky B.',  host: 'Nate Silver'},
    'silver-bulletin':{label: 'Silver Bulletin · text', short: 'SB text', host: 'Nate Silver'},
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
    {host: 'Nate Silver',                      lanes: ['538-politics', 'risky-biz', 'silver-bulletin']},
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
  var margin = {top: 18, right: 14, bottom: 30, left: isMobile ? 92 : 150}

  // one lane per host; every show a host has run lands in the same lane
  var SHORT = {'Joe Weisenthal & Tracy Alloway': 'Weisenthal & Alloway', 'Kevin Roose & Casey Newton': 'Roose & Newton'}
  var laneH = {}, laneY = {}, y = 0
  ROWS.forEach(row => {
    var dense = row.lanes.indexOf('odd-lots') > -1 || row.lanes.indexOf('fresh-air') > -1
    laneH[row.host] = dense ? 44 : 26
    laneY[row.host] = y + laneH[row.host]/2
    row.labelY = laneY[row.host] + 4
    y += laneH[row.host] + 10
  })
  var height = y - 10
  var laneOf = d => SHOWS[d.s].host

  var c = d3.conventions({
    sel: chartSel,
    totalWidth: Math.min(availWidth, 940),
    height: height,
    margin: margin,
  })

  eps.forEach(d => d.date = d.date || new Date(d.d + 'T12:00:00Z'))
  var maxDate = d3.max(eps, d => d.date)
  c.x = d3.scaleUtc()
    .domain([new Date(+d3.min(eps, d => d.date) - 1000*60*60*24*30), new Date(+maxDate + 1000*60*60*24*45)])
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
    d.py = laneY[laneOf(d)] + hash(d.t)*(laneH[laneOf(d)]/2 - 4)
  })

  // ---- row + lane chrome ----
  ROWS.forEach(row => {
    c.svg.append('line.lane-line').at({x1: 0, x2: c.width, y1: laneY[row.host], y2: laneY[row.host]})
    c.svg.append('text.host-label').at({x: -10, y: row.labelY, textAnchor: 'end'})
      .text(isMobile ? (SHORT[row.host] || row.host).split(' & ')[0] : (SHORT[row.host] || row.host))
  })

  // ---- guest → tour computation ----
  // key folds diacritics + middle initials so Žižek == Zizek, Peter R. Orszag == Peter Orszag
  function guestKey(g){
    var p = g.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\./g, '').toLowerCase().split(/\s+/)
      .filter(t => !/^(jr|sr|ii|iii|iv)$/.test(t))
    return p[0] + '|' + p[p.length - 1].split('-')[0]
  }
  var byGuest = {}, guestMeta = {}
  eps.forEach(d => (d.g || []).forEach(g => {
    if (d.r) return                       // reruns ("Best Of", encores) are not appearances
    var k = guestKey(g), list = byGuest[k] = byGuest[k] || []
    if (list.indexOf(d) < 0) list.push(d) // two spellings of one guest in one episode = one appearance
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
        if (hosts.length >= 3){
          var name = ''
          cluster.forEach(d => d.g.forEach(g => {
            if (guestKey(g) == k && g.length > name.length) name = g
          }))
          var tour = {key: k, name, eps: cluster, nHosts: hosts.length, last: cluster[cluster.length - 1].date}
          tours.push(tour)
          cluster.forEach(d => {
            if (!d.tour || tour.nHosts > d.tour.nHosts) { d.tour = tour; d.tier = 3 }
          })
        }
      }
      for (var i = 1; i < list.length; i++){
        if ((list[i].date - list[i-1].date)/864e5 <= W && (list[i].date - cluster[0].date)/864e5 <= 2*W) cluster.push(list[i])
        else { flush(); cluster = [list[i]] }
      }
      flush()
    })
    tours.sort((a, b) => (b.nHosts - a.nHosts) || (b.last - a.last))
    tours.slice().sort((a, b) => byGuest[b.key].length - byGuest[a.key].length || b.last - a.last).forEach((t, i) => t.ci = i)
  }

  // ---- dots ----
  var dotG = c.svg.append('g')
  var dotSel = dotG.appendMany('circle.ep', eps)
    .translate(d => [d.px, d.py])

  var linkG = c.svg.append('g')       // always-on links for 3+ host tours
  var hiG = c.svg.append('g').st({pointerEvents: 'none'})  // hover/pin overlay
  var annG = c.svg.append('g').st({pointerEvents: 'none'})

  var line = d3.line().x(d => d.px).y(d => d.py).curve(d3.curveMonotoneY)
  function tourPath(tour){ return line(tour.eps.slice().sort((a, b) => a.py - b.py || a.px - b.px)) }

  function restyle(){
    dotSel
      .at({r: d => d.p ? (d.tier ? 4.5 : 3) : d.tier ? 4.5 : 1.4})
      .st({
        fill: d => d.p ? '#fff' : d.tier ? runColor(d.tour) : C.base,
        fillOpacity: d => d.tier || d.p ? 1 : .45,
        stroke: d => d.p ? (d.tier ? runColor(d.tour) : '#777') : d.tier ? '#fff' : 'none',
        strokeWidth: d => d.p ? 1.4 : .8,
      })
    dotSel.filter(d => d.tier).raise()

    linkG.html('')
  }

  // ---- highlight a guest: every appearance ever + links on their tour clusters ----
  var pinned = null   // guest key
  function highlight(key){
    hiG.html('')
    var keys = Array.isArray(key) ? key.filter(k => guestMeta[k]) : key && guestMeta[key] ? [key] : []
    annG.st({opacity: keys.indexOf('jasmine|sun') > -1 ? 0 : 1})
    keys.forEach((k, i) => highlightOne(k, i))
  }
  function highlightOne(key, idx){
    var gm = guestMeta[key]
    if (!gm) return
    var gTours = tours.filter(t => t.key == key)
    var color = C.sel
    hiG.appendMany('circle', gm.eps)
      .translate(d => [d.px, d.py])
      .at({r: 6.5, fill: 'none', stroke: color, strokeWidth: 1.6})
    var top = gm.eps.slice().sort((a, b) => a.py - b.py || b.px - a.px)[0]
    var label = gm.name + ' · ' + gm.eps.length + ' appearance' + (gm.eps.length > 1 ? 's' : '')
      + (gm.nShows > 1 ? ' on ' + gm.nShows + ' shows' : '')
    hiG.append('text.hover-name')
      .translate([Math.min(Math.max(top.px, 60), c.width - 10), top.py - 12 - idx*13])
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
    t.append('tspan').at({x: tx, y: ty + 8}).text('Jasmine Sun · ' + d3.nestBy(tour.eps, d => d.s).length + ' shows in ' +
      Math.round((d3.max(tour.eps, d => d.date) - d3.min(tour.eps, d => d.date))/864e5) + ' days')
    annG.append('path').at({
      d: 'M ' + (tx + 4) + ' ' + (ty - 4) + ' Q ' + (top.px - 12) + ' ' + (ty - 10) + ' ' + (top.px - 5) + ' ' + (top.py - 5),
      fill: 'none', stroke: '#999', strokeWidth: 1,
    })
  }

  // ---- chips ----
  var chipSel = d3.select('.c-tours .chips')
  function drawChips(){
    chipSel.html('')
    var top = tours.slice().sort((a, b) => guestMeta[b.key].eps.length - guestMeta[a.key].eps.length).slice(0, 14)
    chipSel.appendMany('button', top)
      .classed('on', t => pinned == t.key)
      .on('click', t => {
        pinned = pinned == t.key ? null : t.key
        d3.select('.c-tours .guest-search').property('value', pinned ? guestMeta[pinned].name : '')
        highlight(pinned)
        drawChips()
        drawMultiples()
      })
      .html('')
      .each(function(t){
        var b = d3.select(this)
        b.append('span.sw').st({background: runColor(t)})
        b.append('b').text(t.name)
        b.append('span.n').text('· ' + guestMeta[t.key].eps.length + ' appearances')
      })
  }

  // ---- small multiples: every 3+ host blitz, zoomed to its window ----
  // press stops that weren't podcast episodes (shown hollow on the cards only)
  var PRINT_STOPS = {
    'jasmine|sun': [{date: new Date('2026-08-17T12:00:00Z'), label: 'Nate Silver · in print'}],
  }
  var multSel = d3.select('.c-tours .multiples')
  var fmtShort = d3.utcFormat('%b %-d'), fmtYr = d3.utcFormat('%b %Y')
  function drawMultiples(){
    multSel.html('')
    var big = tours.slice().sort((a, b) => guestMeta[b.key].eps.length - guestMeta[a.key].eps.length || b.last - a.last)
    if (!big.length) return
    multSel.append('div.mult-head').text('3+ hosts')
    // one shared x-span across all cards so tour pacing is comparable
    var SPAN = Math.max(20, d3.max(big, t =>
      (+d3.max(t.eps, d => d.date) - +d3.min(t.eps, d => d.date))/864e5) + 6)
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
      var rc = runColor(t)
      var stops = t.eps.slice().sort((a, b) => a.date - b.date)
      var days = Math.max(1, Math.round((+stops[stops.length-1].date - +stops[0].date)/864e5))
      var prints = []
      sel.append('div.mult-name').text(t.name)
      sel.append('div.mult-sub').text(t.nHosts + ' hosts · ' + days + ' days · ' + fmtYr(t.last))
      // rows = shows hit, ordered by first stop; centered on the tour in the shared span
      var rows = d3.nestBy(stops, d => d.s)
      prints.forEach((p, i) => {
        p.s = '__print' + i
        var r = [p]; r.key = p.s
        var before = rows.filter(rr => +rr[0].date <= +p.date).length
        rows.splice(before, 0, r)
      })
      var mid = (+stops[0].date + +stops[stops.length-1].date)/2
      var t0 = mid - SPAN/2*864e5, t1 = mid + SPAN/2*864e5
      var W = 208, rowH = 18, padT = 6, padB = 20, tlL = 6, tlR = 88
      var H = padT + rows.length*rowH + padB
      var svg = sel.append('svg').at({width: W, height: H})
      var x = d3.scaleUtc().domain([t0, t1]).range([tlL + 4, W - tlR - 6])
      var rowY = {}
      rows.forEach((r, i) => { rowY[r.key] = padT + i*rowH + rowH/2 })
      var isPrint = key => key.indexOf('__print') == 0
      // context: every other episode those feeds published inside the window
      rows.forEach(r => {
        var yy = rowY[r.key]
        svg.append('line').at({x1: tlL, x2: W - tlR, y1: yy, y2: yy, stroke: '#f1f1f1'})
        if (isPrint(r.key)) return
        eps.forEach(d => {
          if (d.s != r.key || +d.date < t0 || +d.date > t1) return
          if (r.indexOf(d) > -1) return
          svg.append('circle').at({cx: x(d.date), cy: yy, r: 2, fill: C.base, fillOpacity: .7})
        })
      })
      // time axis: weekly ticks, month boundaries labeled (the window edges themselves mean nothing)
      var axisY = padT + rows.length*rowH + 4
      x.ticks(d3.utcWeek).forEach(d => {
        svg.append('line').at({x1: x(d), x2: x(d), y1: axisY, y2: axisY + 3, stroke: '#ccc'})
      })
      x.ticks(d3.utcMonth).forEach(d => {
        svg.append('line').at({x1: x(d), x2: x(d), y1: padT - 2, y2: axisY + 5, stroke: '#e2e2e2'})
        svg.append('text.mult-axis').at({x: x(d) + 3, y: axisY + 13}).text(d3.utcFormat('%b')(d))
      })
      // connecting path through every stop (podcast + print), then dots on top
      var all = stops.concat(prints).sort((a, b) => a.date - b.date)
      var pts = all.map(d => [x(d.date), rowY[d.s]])
      svg.append('path').at({
        d: 'M' + pts.map(p => p.join(' ')).join(' L '),
        fill: 'none', stroke: rc, strokeWidth: 1.2, opacity: .45,
      })
      all.forEach(d => {
        var print = isPrint(d.s) || !!d.p
        svg.append('circle')
          .at({cx: x(d.date), cy: rowY[d.s], r: 4.5,
               fill: print ? '#fff' : rc, stroke: print ? rc : '#fff', strokeWidth: print ? 1.5 : 1})
          .append('title').text(fmtShort(d.date) + (d.t ? ' · ' + d.t : ' · ' + d.label))
      })
      rows.forEach(r => {
        svg.append('text.mult-show').at({x: W - tlR + 4, y: rowY[r.key] + 3})
          .text(isPrint(r.key) ? r[0].label : SHOWS[r.key].short)
      })
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
      highlight(best.g && best.g.length ? best.g.map(guestKey) : pinned)
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
      var left = Math.max(0, Math.min(mx + margin.left + 14, node.width - 310))
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
    countSel.text(tours.length + ' runs of 3+ hosts')
  }
  // ---- guest search (find every appearance, ever) ----
  var names = Object.values(guestMeta).sort((a, b) => b.eps.length - a.eps.length)
  var sugSel = d3.select('.c-tours .suggest')
  function showSuggest(q){
    var hits = (q.length > 1 ? names.filter(g => fold(g.name).indexOf(q) > -1) : names).slice(0, 8)
    sugSel.html('').classed('open', hits.length > 0)
    sugSel.appendMany('button', hits)
      .on('click', g => {
        pinned = g.key
        d3.select('.c-tours .guest-search').property('value', g.name)
        sugSel.html('').classed('open', false)
        highlight(pinned); drawChips(); drawMultiples()
      })
      .each(function(g){
        var b = d3.select(this)
        b.append('b').text(g.name)
        b.append('span.n').text('· ' + g.eps.length + (g.nShows > 1 ? ' · ' + g.nShows + ' shows' : ''))
      })
  }
  function fold(s){ return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() }
  d3.select('.c-tours .guest-search')
    .on('focus', function(){ showSuggest(fold(this.value)) })
    .on('blur', function(){ setTimeout(() => sugSel.classed('open', false), 200) })
    .on('input change', function(){
      var q = fold(this.value)
      showSuggest(q)
      if (!q){ pinned = null; highlight(null); drawChips(); drawMultiples(); return }
      var hit = names.filter(g => fold(g.name) == q)[0]
      if (hit){ pinned = hit.key; highlight(pinned); drawChips(); drawMultiples() }
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
