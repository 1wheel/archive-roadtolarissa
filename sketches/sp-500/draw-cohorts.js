// Cohort lifespan distributions: group companies by the decade they ENTERED (or
// EXITED) the S&P 500, and show how long each lasted as a dot-histogram per decade
// (one dot = one company-stint, stacked by lifespan bin). Still-in companies are
// right-censored (their true lifespan is a lower bound) and drawn hollow.
window.drawCohorts = function(data){
  var STILL_IN = 2026.3
  var mode = window.__cohortMode || 'entry'   // 'entry' | 'exit'
  var floor = data.floor

  var sel = d3.select('.c-cohorts .chart').html('')
  if (!sel.node()) return

  // ---- toggle ----
  var head = sel.append('div.co-head')
  head.append('span.co-sub')
    .text(mode === 'entry' ? 'How long companies lasted, by the decade they joined'
                           : 'How long companies lasted, by the decade they left')
  var toggle = head.append('span.co-toggle')
  ;[['entry', 'by entry decade'], ['exit', 'by exit decade']].forEach(function(d){
    toggle.append('button').classed('on', mode === d[0]).text(d[1])
      .on('click', function(){ window.__cohortMode = d[0]; window.drawCohorts(data) })
  })

  // ---- per-stint lifespan + cohort bucket ----
  var items = data.spans.map(function(s){
    var stillIn = s.exit_t >= STILL_IN
    return {id: s.id, ticker: s.ticker, name: s.name, entry: s.entry, og: s.og,
            enter_t: s.enter_t, exit_t: s.exit_t, stillIn: stillIn,
            life: Math.max(0, s.exit_t - s.enter_t)}
  })

  // bucket rows. entry: pre-1962 (og) then 1960s..2020s. exit: 1960s..2020s then "still in".
  var DEC = [1960,1970,1980,1990,2000,2010,2020]
  var rows
  if (mode === 'entry'){
    rows = [{key:'og', label:'pre-1962', items: items.filter(function(d){ return d.og })}]
      .concat(DEC.map(function(dd){ return {key:dd, label:(dd%100)+'s',
        items: items.filter(function(d){ return !d.og && Math.floor(d.entry/10)*10 === dd })} }))
  } else {
    rows = DEC.map(function(dd){ return {key:dd, label:(dd%100)+'s',
        items: items.filter(function(d){ return !d.stillIn && Math.floor(d.exit_t/10)*10 === dd })} })
      .concat([{key:'in', label:'still in', items: items.filter(function(d){ return d.stillIn })}])
  }
  rows = rows.filter(function(r){ return r.items.length })

  // ---- layout ----
  var isMobile = window.innerWidth < 620
  var totalWidth = Math.min(window.innerWidth - 32, 960)
  var margin = {top: 30, right: 20, bottom: 38, left: isMobile ? 64 : 78}
  var rowH = isMobile ? 56 : 64
  var W = totalWidth - margin.left - margin.right
  var H = rows.length * rowH

  var plot = sel.append('div.co-plot')
  var c = d3.conventions({sel: plot, totalWidth: totalWidth, height: H, margin: margin})
  c.x = d3.scaleLinear().domain([0, 64]).range([0, c.width])
  c.xAxis = d3.axisBottom(c.x).ticks(isMobile ? 6 : 10).tickFormat(function(d){ return d })

  // ggPlot panel + white vertical gridlines, lowered behind the dots
  var gg = c.svg.append('g.gg').lower()
  gg.append('rect').at({width: c.width, height: c.height, fill: '#EAECED'})
  gg.appendMany('line', c.x.ticks(isMobile ? 6 : 10))
    .at({y1: 0, y2: c.height, x1: c.x, x2: c.x, stroke: '#fff', strokeWidth: 1})

  // turbo by lifespan, hollow for still-in (censored)
  var LIFE_MAX = 64
  function turbo(t){
    t = t < 0 ? 0 : t > 1 ? 1 : t
    var r = 0.13572138 + t*(4.61539260 + t*(-42.66032258 + t*(132.13108234 + t*(-152.94239396 + t*59.28637943))))
    var g = 0.09140261 + t*(2.19418839 + t*(4.84296658 + t*(-14.18503333 + t*(4.27729857 + t*2.82956604))))
    var b = 0.10667330 + t*(12.64194608 + t*(-60.58204836 + t*(110.36276771 + t*(-89.90310912 + t*27.34824973))))
    function cc(v){ return Math.round(255*(v < 0 ? 0 : v > 1 ? 1 : v)) }
    return 'rgb(' + cc(r) + ',' + cc(g) + ',' + cc(b) + ')'
  }
  function colr(d){ return turbo(d.life / LIFE_MAX) }

  // ---- dot histogram per row (Wilkinson-style stacking) ----
  var binW = 1.6                                  // years per bin
  var dotR = isMobile ? 1.9 : 2.1
  var dotGap = dotR * 2 + 0.6
  var ttSel = window.ttSel

  rows.forEach(function(row, ri){
    var base = ri * rowH + rowH - 12              // row baseline (dots stack upward)
    var maxStack = Math.floor((rowH - 20) / dotGap)
    // bin + stack
    var byBin = d3.nestBy(row.items.slice().sort(function(a,b){ return a.life - b.life }),
      function(d){ return Math.floor(d.life / binW) })
    byBin.forEach(function(bin){
      bin.forEach(function(d, i){
        var col = i % maxStack, extra = Math.floor(i / maxStack)   // overflow -> slight x jitter
        d._x = c.x((+bin.key + 0.5) * binW) + extra * 1.1
        d._y = base - col * dotGap
      })
    })
    // row label + n
    c.svg.append('text.co-row-label').text(row.label)
      .at({x: -10, y: base - 1, textAnchor: 'end', fontSize: 12, fontWeight: 600, fill: '#444'})
    c.svg.append('text.co-row-n').text(row.items.length)
      .at({x: -10, y: base + 12, textAnchor: 'end', fontSize: 9.5, fill: '#aaa'})

    // median lifespan tick (lower bound where the row holds still-in companies)
    var lifes = row.items.map(function(d){ return d.life }).sort(d3.ascending)
    var med = d3.quantile(lifes, 0.5)
    var hasCensored = row.items.some(function(d){ return d.stillIn })
    c.svg.append('line').at({x1: c.x(med), x2: c.x(med), y1: base + 4, y2: base - maxStack*dotGap - 2,
      stroke: '#1d3557', strokeWidth: 1, opacity: 0.5, strokeDasharray: hasCensored ? '2 2' : null})
    c.svg.append('text').text('med ' + med.toFixed(0))
      .at({x: c.x(med) + 3, y: ri*rowH + 11, fontSize: 9, fill: '#1d3557', opacity: 0.7})

    // dots
    c.svg.appendMany('circle.co-dot', row.items)
      .at({cx: function(d){ return d._x }, cy: function(d){ return d._y }, r: dotR,
        fill: function(d){ return d.stillIn ? '#fff' : colr(d) },
        stroke: function(d){ return d.stillIn ? '#9aa6b8' : 'none' },
        strokeWidth: function(d){ return d.stillIn ? 1 : 0 }})
      .on('mousemove', function(d){
        if (!ttSel) return
        var joined = d.og ? 'before 1962' : Math.floor(d.entry)
        var left = d.stillIn ? 'still in' : Math.floor(d.exit_t)
        ttSel.classed('tooltip-hidden', false).html(
          '<div class="tt-tick">' + (d.name || d.ticker || d.id) + '</div>' +
          (d.ticker ? '<div class="tt-row">' + d.ticker + '</div>' : '') +
          '<div class="tt-row">joined <b>' + joined + '</b></div>' +
          '<div class="tt-row">left <b>' + left + '</b></div>' +
          '<div class="tt-row">lasted <b>' + d.life.toFixed(1) + ' yr</b></div>')
        ttSel.st({left: Math.min(d3.event.pageX + 14, window.innerWidth - 200) + 'px', top: (d3.event.pageY + 14) + 'px'})
      })
      .on('mouseout', function(){ if (ttSel) ttSel.classed('tooltip-hidden', true) })
  })

  // ---- x axis only (rows ARE the y; drop the spurious 0-1 y axis) ----
  d3.drawAxis(c)
  c.svg.select('.y').remove()
  c.svg.selectAll('.x').classed('axis', 1)
  c.svg.selectAll('.domain').remove()
  c.svg.selectAll('.tick line').st({display: 'none'})
  c.svg.selectAll('.x text').at({y: 9, fontSize: 11, fill: '#8a8a8a'})
  c.svg.append('text').text('years lasted in the index →')
    .at({x: 0, y: c.height + 30, fontSize: 10.5, fill: '#999'})

  // legend: hollow = still in (censored)
  c.svg.append('circle').at({cx: c.width - 150, cy: -14, r: dotR, fill: '#fff', stroke: '#9aa6b8', strokeWidth: 1})
  c.svg.append('text').text('hollow = still in the index (lifespan ongoing)')
    .at({x: c.width - 142, y: -10, fontSize: 10, fill: '#888'})
}
