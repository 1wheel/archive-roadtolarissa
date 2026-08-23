// One lane per host (every show they've run), one tiny dot per episode, 2016-2026.
// A guest on 3+ different hosts' shows with <= W days between consecutive stops is a
// "run": its dots take one of a few muted colors. Hover/tap an episode for a chunky
// panel listing every appearance of that episode's guest(s); each guest gets a bright
// ring color. Guest names come from feed text + LLM extraction: treat as best-effort,
// and as untrusted strings (everything lands in the DOM escaped or via .text()).
window.drawTours = function(allEps){
  var eps = allEps.filter(d => d.d >= '2016-01-01')
  var C = {base: '#1f1f1f', sel: '#e0218a'}
  var RUN = ['#c4616c', '#6b8bc3', '#d4ad4a', '#5aaea1']      // muted, one per run; extras fold to neutral
  var SEL = ['#ff1fa3', '#00b7ff', '#ffb400', '#8a2be2']      // bright ring colors, one per guest on the hovered episode
  var runColor = t => t && t.ci < RUN.length ? RUN[t.ci] : '#666'

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
  // big label = the show; small label = the host's other shows folded into the lane
  var ROWS = [
    {host: 'Ezra Klein',                     show: 'The Ezra Klein Show',    sub: '+ Vox era, Impeachment',        lanes: ['ek-vox', 'impeachment', 'ek-nyt']},
    {host: 'Derek Thompson',                 show: 'Plain English',          sub: '+ Crazy/Genius',                lanes: ['crazy-genius', 'plain-english']},
    {host: 'Joe Weisenthal & Tracy Alloway', show: 'Odd Lots',               sub: '',                              lanes: ['odd-lots']},
    {host: 'Nate Silver',                    show: '538 Politics',           sub: '+ Risky Business, Silver Bulletin', lanes: ['538-politics', 'risky-biz', 'silver-bulletin']},
    {host: 'PJ Vogt',                        show: 'Search Engine',          sub: '+ Reply All, Crypto Island',    lanes: ['reply-all', 'crypto-island', 'search-engine']},
    {host: 'Kevin Roose & Casey Newton',     show: 'Hard Fork',              sub: '',                              lanes: ['hard-fork']},
    {host: 'Nilay Patel',                    show: 'Decoder',                sub: '',                              lanes: ['decoder']},
    {host: 'Tyler Cowen',                    show: 'Conversations with Tyler', sub: '',                            lanes: ['tyler']},
    {host: 'Dwarkesh Patel',                 show: 'Dwarkesh Podcast',       sub: '',                              lanes: ['dwarkesh']},
    {host: 'Terry Gross',                    show: 'Fresh Air',              sub: '',                              lanes: ['fresh-air']},
    {host: 'Ira Glass',                      show: 'This American Life',     sub: '',                              lanes: ['tal']},
  ]

  // ---- layout ----
  var chartSel = d3.select('.c-tours .chart').html('').st({position: 'relative'})
  var measured = chartSel.node().getBoundingClientRect().width || window.innerWidth
  var availWidth = Math.min(measured, document.documentElement.clientWidth - 10)
  var isMobile = availWidth < 640
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches
  var margin = {top: 18, right: 14, bottom: 30, left: isMobile ? 104 : 170}

  var laneH = {}, laneY = {}, y = 0
  ROWS.forEach(row => {
    var dense = row.lanes.indexOf('odd-lots') > -1 || row.lanes.indexOf('fresh-air') > -1
    laneH[row.host] = dense ? 44 : 30
    laneY[row.host] = y + laneH[row.host]/2
    y += laneH[row.host] + 10
  })
  var height = y - 10
  var laneOf = d => SHOWS[d.s].host

  var c = d3.conventions({sel: chartSel, totalWidth: Math.min(availWidth, 940), height: height, margin: margin})

  eps.forEach(d => d.date = d.date || new Date(d.d + 'T12:00:00Z'))
  var maxDate = d3.max(eps, d => d.date)
  c.x = d3.scaleUtc().domain([new Date('2016-01-01'), new Date(+maxDate + 1000*60*60*24*45)]).range([0, c.width])
  c.svg.append('g').attr('class', 'x axis').translate(c.height + 4, 1)
    .call(d3.axisBottom(c.x).ticks(isMobile ? 6 : 11).tickSize(-c.height - 4))

  // deterministic jitter; seed mixes url+title+date so shared generic links don't line up
  function hash(s){
    var h = 0
    for (var i = 0; i < s.length; i++) h = (h*31 + s.charCodeAt(i)) % 1000003
    return h/1000003*2 - 1
  }
  eps.forEach(d => {
    d.px = c.x(d.date)
    d.py = laneY[laneOf(d)] + hash((d.u || '') + '|' + d.t + '|' + d.d)*(laneH[laneOf(d)]/2 - 4)
  })

  // ---- lane chrome: show name big, other shows small ----
  ROWS.forEach(row => {
    var yy = laneY[row.host]
    c.svg.append('line.lane-line').at({x1: 0, x2: c.width, y1: yy, y2: yy})
    var hasSub = !!row.sub
    c.svg.append('text.host-label').at({x: -10, y: yy + (hasSub ? -1 : 4), textAnchor: 'end'})
      .text(isMobile ? row.show.replace('The Ezra Klein Show', 'Ezra Klein Show').replace('Conversations with Tyler', 'Conv. w/ Tyler') : row.show)
    if (hasSub) c.svg.append('text.lane-sub').at({x: -10, y: yy + 11, textAnchor: 'end'}).text(row.sub)
  })

  // ---- guest index (diacritics, periods, middle initials, suffixes and hyphenated surnames folded) ----
  function guestKey(g){
    var p = g.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\./g, '').toLowerCase().split(/\s+/)
      .filter(t => !/^(jr|sr|ii|iii|iv)$/.test(t))
    return p[0] + '|' + p[p.length - 1].split('-')[0]
  }
  var byGuest = {}, guestMeta = {}
  eps.forEach(d => (d.g || []).forEach(g => {
    if (d.r) return                       // reruns are not appearances
    var k = guestKey(g), list = byGuest[k] = byGuest[k] || []
    if (list.indexOf(d) < 0) list.push(d)
  }))
  Object.keys(byGuest).forEach(k => {
    var list = byGuest[k].sort((a, b) => a.date - b.date), name = ''
    list.forEach(d => d.g.forEach(g => { if (guestKey(g) == k && g.length > name.length) name = g }))
    guestMeta[k] = {key: k, name, eps: list, nShows: d3.nestBy(list, d => d.s).length, nHosts: d3.nestBy(list, d => laneOf(d)).length}
  })
  var names = Object.values(guestMeta).sort((a, b) => b.eps.length - a.eps.length || b.nHosts - a.nHosts)

  // ---- runs: same guest, 3+ hosts, <= W days between consecutive stops, total span <= 2W ----
  var tours = []
  function computeTours(W){
    tours = []
    eps.forEach(d => { d.tour = null; d.tier = 0 })
    Object.keys(byGuest).forEach(k => {
      var list = byGuest[k].slice().sort((a, b) => a.date - b.date), cluster = [list[0]]
      var flush = () => {
        var hosts = d3.nestBy(cluster, d => laneOf(d))
        if (hosts.length >= 3){
          var tour = {key: k, name: guestMeta[k].name, eps: cluster, nHosts: hosts.length, last: cluster[cluster.length - 1].date}
          tours.push(tour)
          cluster.forEach(d => { if (!d.tour || tour.nHosts > d.tour.nHosts){ d.tour = tour; d.tier = 3 } })
        }
      }
      for (var i = 1; i < list.length; i++){
        if ((list[i].date - list[i-1].date)/864e5 <= W && (list[i].date - cluster[0].date)/864e5 <= 2*W) cluster.push(list[i])
        else { flush(); cluster = [list[i]] }
      }
      flush()
    })
    tours.sort((a, b) => byGuest[b.key].length - byGuest[a.key].length || b.last - a.last)
    tours.forEach((t, i) => t.ci = i)
  }

  // ---- dots ----
  var dotG = c.svg.append('g')
  var dotSel = dotG.appendMany('circle.ep', eps).translate(d => [d.px, d.py])
  var hiG = c.svg.append('g').st({pointerEvents: 'none'})
  var annG = c.svg.append('g').st({pointerEvents: 'none'})

  function restyle(){
    dotSel
      .at({r: d => d.p ? (d.tier ? 4 : 2.6) : d.tier ? 4 : 1.2})
      .st({
        fill: d => d.p ? '#fff' : d.tier ? runColor(d.tour) : C.base,
        fillOpacity: d => d.tier || d.p ? .95 : .28,
        stroke: d => d.p ? (d.tier ? runColor(d.tour) : '#888') : d.tier ? '#fff' : 'none',
        strokeWidth: d => d.p ? 1.2 : .7,
      })
    dotSel.filter(d => d.tier).raise()
  }

  // ---- highlight: every appearance of each given guest, one bright ring color per guest ----
  var pinned = null   // guest key pinned from a card or the search box
  function highlight(keys){
    hiG.html('')
    keys = (Array.isArray(keys) ? keys : keys ? [keys] : []).filter(k => guestMeta[k])
    annG.st({opacity: keys.indexOf('jasmine|sun') > -1 ? 0 : 1})
    keys.forEach((k, i) => {
      var gm = guestMeta[k], color = SEL[i % SEL.length]
      hiG.appendMany('circle', gm.eps).translate(d => [d.px, d.py]).at({r: 6, fill: 'none', stroke: color, strokeWidth: 1.8})
      var top = gm.eps.slice().sort((a, b) => a.py - b.py || b.px - a.px)[0]
      hiG.append('text.hover-name')
        .translate([Math.min(Math.max(top.px, 60), c.width - 10), top.py - 12 - i*13])
        .at({textAnchor: top.px > c.width*.75 ? 'end' : 'middle'})
        .text(gm.name + ' · ' + gm.eps.length + (gm.eps.length > 1 ? ' appearances' : ' appearance') + (gm.nShows > 1 ? ' on ' + gm.nShows + ' shows' : ''))
    })
  }
  // guests of an episode ordered by how often they've appeared (most first)
  function guestKeysOf(d){
    var seen = {}, out = []
    ;(d.g || []).forEach(g => { var k = guestKey(g); if (guestMeta[k] && !seen[k]){ seen[k] = 1; out.push(k) } })
    return out.sort((a, b) => guestMeta[b].eps.length - guestMeta[a].eps.length)
  }

  // ---- annotation: the run that started this ----
  function drawAnnotation(){
    annG.html('')
    var tour = tours.filter(t => t.key == 'jasmine|sun' && +t.last > +new Date('2026-07-01'))[0]
    if (!tour || isMobile) return
    var top = tour.eps.slice().sort((a, b) => a.py - b.py)[0]
    var tx = top.px - 130, ty = top.py - 20
    annG.append('text.annotation').at({textAnchor: 'end', x: tx, y: ty + 8})
      .text('Jasmine Sun · ' + d3.nestBy(tour.eps, d => d.s).length + ' shows in ' + Math.round((d3.max(tour.eps, d => d.date) - d3.min(tour.eps, d => d.date))/864e5) + ' days')
    annG.append('path').at({d: 'M ' + (tx + 4) + ' ' + (ty - 4) + ' Q ' + (top.px - 12) + ' ' + (ty - 10) + ' ' + (top.px - 5) + ' ' + (top.py - 5), fill: 'none', stroke: '#999', strokeWidth: 1})
  }

  // ---- small multiples: one card per run, shared x-span, feed context dots ----
  var multSel = d3.select('.c-tours .multiples')
  var fmtShort = d3.utcFormat('%b %-d'), fmtYr = d3.utcFormat('%b %Y'), fmt = d3.utcFormat('%b %-d, %Y')
  function drawMultiples(){
    multSel.html('')
    if (!tours.length) return
    multSel.append('div.mult-head').text('3+ hosts')
    var SPAN = Math.max(20, d3.max(tours, t => (+d3.max(t.eps, d => d.date) - +d3.min(t.eps, d => d.date))/864e5) + 6)
    var cards = multSel.append('div.grid').appendMany('div.mult-card', tours)
      .classed('on', t => pinned == t.key)
      .on('click', t => {
        pinned = pinned == t.key ? null : t.key
        d3.select('.c-tours .guest-search').property('value', pinned ? guestMeta[pinned].name : '')
        highlight(pinned); drawMultiples()
      })
    cards.each(function(t){
      var sel = d3.select(this), rc = runColor(t)
      var stops = t.eps.slice().sort((a, b) => a.date - b.date)
      var days = Math.max(1, Math.round((+stops[stops.length-1].date - +stops[0].date)/864e5))
      sel.append('div.mult-name').text(t.name)
      sel.append('div.mult-sub').text(t.nHosts + ' hosts · ' + days + ' days · ' + fmtYr(t.last))
      var rows = d3.nestBy(stops, d => d.s)
      var mid = (+stops[0].date + +stops[stops.length-1].date)/2, t0 = mid - SPAN/2*864e5, t1 = mid + SPAN/2*864e5
      var W = 208, rowH = 18, padT = 6, padB = 20, tlL = 6, tlR = 88, H = padT + rows.length*rowH + padB
      var svg = sel.append('svg').at({viewBox: '0 0 ' + W + ' ' + H}).st({width: '100%', height: 'auto'})
      var x = d3.scaleUtc().domain([t0, t1]).range([tlL + 4, W - tlR - 6]), rowY = {}
      rows.forEach((r, i) => { rowY[r.key] = padT + i*rowH + rowH/2 })
      rows.forEach(r => {
        var yy = rowY[r.key]
        svg.append('line').at({x1: tlL, x2: W - tlR, y1: yy, y2: yy, stroke: '#f1f1f1'})
        eps.forEach(d => {
          if (d.s != r.key || +d.date < t0 || +d.date > t1 || r.indexOf(d) > -1) return
          svg.append('circle').at({cx: x(d.date), cy: yy, r: 1.6, fill: '#333', fillOpacity: .35})
        })
      })
      var axisY = padT + rows.length*rowH + 4
      x.ticks(d3.utcWeek).forEach(d => svg.append('line').at({x1: x(d), x2: x(d), y1: axisY, y2: axisY + 3, stroke: '#ccc'}))
      x.ticks(d3.utcMonth).forEach(d => {
        svg.append('line').at({x1: x(d), x2: x(d), y1: padT - 2, y2: axisY + 5, stroke: '#e2e2e2'})
        svg.append('text.mult-axis').at({x: x(d) + 3, y: axisY + 13}).text(d3.utcFormat('%b')(d))
      })
      svg.append('path').at({d: 'M' + stops.map(d => x(d.date) + ' ' + rowY[d.s]).join(' L '), fill: 'none', stroke: rc, strokeWidth: 1.2, opacity: .45})
      stops.forEach(d => svg.append('circle').at({cx: x(d.date), cy: rowY[d.s], r: 4.5, fill: d.p ? '#fff' : rc, stroke: d.p ? rc : '#fff', strokeWidth: d.p ? 1.5 : 1})
        .append('title').text(fmtShort(d.date) + ' · ' + d.t))
      rows.forEach(r => svg.append('text.mult-show').at({x: W - tlR + 4, y: rowY[r.key] + 3}).text(SHOWS[r.key].short))
    })
  }

  // ---- the chunky panel: hovered episode + every appearance of each of its guests ----
  var esc = s => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  var panel = d3.select('.c-tours').selectAppend('div.panel.panel-hidden')
  var stuck = false   // true when tapped/clicked into place (scrollable, clickable); click elsewhere dismisses
  function panelHtml(d){
    var keys = guestKeysOf(d)
    var html = "<div class='p-ep'><span class='p-show'>" + esc(SHOWS[d.s].label) + '</span> · ' + fmt(d.date)
      + (d.r ? ' · rerun' : '') + (d.p ? ' · text' : '')
      + "<div class='p-title'>" + (d.u ? "<a href='" + esc(d.u) + "' target='_blank' rel='noopener'>" + esc(d.t) + ' ↗</a>' : esc(d.t)) + '</div>'
      + (d.x ? "<div class='p-desc'>" + esc(d.x) + '</div>' : '') + '</div>'
    keys.forEach((k, i) => {
      var gm = guestMeta[k], color = SEL[i % SEL.length]
      html += "<div class='p-guest'><div class='p-gname'><span class='p-sw' style='background:" + color + "'></span>" + esc(gm.name)
        + " <span class='p-n'>" + gm.eps.length + (gm.eps.length > 1 ? ' appearances' : ' appearance') + ' · ' + gm.nHosts + (gm.nHosts > 1 ? ' hosts' : ' host') + '</span></div><ol class="p-list">'
      gm.eps.slice().sort((a, b) => b.date - a.date).forEach(e => {
        html += "<li" + (e === d ? " class='cur'" : '') + "><span class='p-d'>" + fmt(e.date) + "</span> <span class='p-s'>" + esc(SHOWS[e.s].short) + '</span> '
          + (e.u ? "<a href='" + esc(e.u) + "' target='_blank' rel='noopener'>" + esc(e.t) + '</a>' : esc(e.t)) + '</li>'
      })
      html += '</ol></div>'
    })
    if (!keys.length) html += "<div class='p-guest p-none'>no guest identified</div>"
    return html
  }
  function showPanel(d, mx, my){
    panel.classed('panel-hidden', false).classed('stuck', stuck).html(panelHtml(d))
    if (stuck || coarse) return
    var node = chartSel.node().getBoundingClientRect()
    var left = Math.max(0, Math.min(mx + margin.left + 16, node.width - 380))
    panel.st({left: left + 'px', top: (my + margin.top + 16) + 'px'})
  }
  function hidePanel(){ if (!stuck){ panel.classed('panel-hidden', true); highlight(pinned) } }

  function nearest(node){
    var m = d3.mouse(node), best = null, lim = coarse ? 22 : 16, bestD = lim*lim
    eps.forEach(d => { var dx = d.px - m[0], dy = d.py - m[1], dd = dx*dx + dy*dy; if (dd < bestD){ bestD = dd; best = d } })
    return {best: best, mx: m[0], my: m[1]}
  }
  c.svg.append('rect').at({width: c.width, height: c.height, opacity: 0})
  c.svg
    .on('mousemove', function(){
      if (stuck || coarse) return
      var n = nearest(this)
      if (!n.best){ hidePanel(); return }
      var keys = guestKeysOf(n.best)
      highlight(keys.length ? keys : pinned)
      showPanel(n.best, n.mx, n.my)
    })
    .on('mouseleave', hidePanel)
    .on('click', function(){
      var n = nearest(this)
      d3.event.stopPropagation()
      if (!n.best){ stuck = false; panel.classed('stuck', false); hidePanel(); return }
      stuck = true
      highlight(guestKeysOf(n.best))
      showPanel(n.best, n.mx, n.my)
    })
  d3.select(document).on('click.podtour', function(){
    if (!stuck) return
    if (panel.node().contains(d3.event.target)) return
    stuck = false; panel.classed('stuck', false); hidePanel()
  })

  // ---- guest search: scrollable list, most-booked first when the box is empty ----
  var sugSel = d3.select('.c-tours .suggest')
  function fold(s){ return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() }
  function showSuggest(q){
    var hits = (q.length > 1 ? names.filter(g => fold(g.name).indexOf(q) > -1) : names).slice(0, 60)
    sugSel.html('').classed('open', hits.length > 0)
    sugSel.appendMany('button', hits)
      .on('click', g => {
        pinned = g.key
        d3.select('.c-tours .guest-search').property('value', g.name)
        sugSel.html('').classed('open', false)
        highlight(pinned); drawMultiples()
      })
      .each(function(g){
        var b = d3.select(this)
        b.append('b').text(g.name)
        b.append('span.n').text('· ' + g.eps.length + (g.nHosts > 1 ? ' · ' + g.nHosts + ' hosts' : ''))
      })
  }
  d3.select('.c-tours .guest-search')
    .on('focus', function(){ showSuggest(fold(this.value)) })
    .on('blur', function(){ setTimeout(() => sugSel.classed('open', false), 250) })
    .on('input change', function(){
      var q = fold(this.value)
      showSuggest(q)
      if (!q){ pinned = null; highlight(null); drawMultiples(); return }
      var hit = names.filter(g => fold(g.name) == q)[0]
      if (hit){ pinned = hit.key; highlight(pinned); drawMultiples() }
    })

  // ---- window slider ----
  var countSel = d3.select('.c-tours .tour-count')
  function recompute(W){
    computeTours(W); restyle(); drawMultiples(); drawAnnotation(); highlight(pinned)
    countSel.text(tours.length + ' runs of 3+ hosts')
  }
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
