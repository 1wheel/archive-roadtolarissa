// Canvas heatmap of S&P 500 membership: x = quarter, y = rank (newest at the
// bottom). Colour toggles between AGE (turbo) and DECADE-JOINED. Grey = undatable
// pre-1962 OG members, forced to the top of every column. Hover boxes one
// company's cell (keyed by UNIQUE id) in every quarter it appears, in magenta.
// Tickers are reused over time (old vs modern ADM/TXT) so we group/trace/hit-test
// by d.id, NEVER d.ticker. Re-runnable on resize.
window.drawHeatmap = function(data){
  var floor = data.floor
  var STILL_IN = 2026.3   // exit_year >= this => company is still in the index
  var isMobile = window.innerWidth < 620
  var mode = window.__heatMode || 'age'   // 'age' | 'decade' (persists across resize)

  var sel = d3.select('.c-heatmap .chart').html('')

  // ---- toggle ----
  var head = sel.append('div.hm-head')
  head.append('span.hm-subhead').text('Members stacked by tenure')
  var toggle = head.append('span.hm-toggle')
  ;[['age', 'age'], ['decade', 'decade joined']].forEach(function(d){
    toggle.append('button')
      .classed('on', mode === d[0])
      .text(d[1])
      .on('click', function(){ window.__heatMode = d[0]; window.drawHeatmap(data) })
  })

  // ---- per-column member objects + trace index ----
  // Each column row carries the UNIQUE id (for tracing) plus ticker/name for the
  // tooltip. entry_year is never null in the parquet; OG = entry on/before floor.
  var columns = data.columns.map(function(col, ci){
    var year = col.t
    var m = col.map(function(row){
      var ey = row.entry_year
      if (ey === undefined || (typeof ey == 'number' && isNaN(ey))) ey = null
      var ticker = row.ticker == null ? '' : row.ticker
      var isPre = ey === null || ey <= floor
      return {id: row.id, ticker: ticker, name: row.name, entry: ey,
        exit: row.exit_year, isPre: isPre,
        ten: Math.max(0, year - (ey === null ? floor : ey))}
    })
    return {q: col.q, year: year, idx: ci, m: m, n: m.length}
  })

  // trace by UNIQUE id (NOT ticker — tickers are reused across distinct companies,
  // so a ticker index would highlight the wrong firm's cells).
  var idRows = {}
  columns.forEach(function(col){
    // grey OG on top, then tenure ascending, then exit_year ascending. The exit
    // secondary is a STABLE tie-break so neighbours don't churn quarter-to-quarter.
    col.m.sort(function(a, b){
      if (a.isPre !== b.isPre) return a.isPre ? 1 : -1   // grey OG on top
      return (a.ten - b.ten) || (a.exit - b.exit)        // young bottom -> old top
    })
    col.m.forEach(function(d, r){
      (idRows[d.id] || (idRows[d.id] = [])).push({ci: col.idx, r: r})
    })
  })

  // ---- layout ----
  var totalWidth = Math.min(window.innerWidth - 32, 960)
  var margin = isMobile ? {top: 30, right: 14, bottom: 44, left: 38} : {top: 38, right: 24, bottom: 48, left: 52}
  var maxN = d3.max(columns, function(d){ return d.n })

  // Build canvases + svg explicitly (matches draw-marey): height = maxN so each
  // company is exactly 1px tall. Canvas is sized for devicePixelRatio (so it's
  // crisp), the svg sits on top (z-index in CSS) for the legend, axes + hover.
  var plotSel = sel.append('div.hm-plot')
  var W = totalWidth - margin.left - margin.right
  var H = maxN
  var ratio = window.devicePixelRatio || 1
  var totalH = H + margin.top + margin.bottom
  var cvW = W + margin.left + margin.right

  var years = columns.map(function(d){ return d.year })
  var x = d3.scaleLinear().domain([d3.min(years), d3.max(years)]).range([0, W])
  var colW = W / (columns.length - 1)
  var cellH = 1

  // base canvas (the cells) — 1 unit = 1 CSS px, translated past the margin
  var ctxSel = plotSel.append('canvas')
    .at({width: cvW * ratio, height: totalH * ratio})
    .st({width: cvW + 'px', height: totalH + 'px'})
  var ctx = ctxSel.node().getContext('2d')
  ctx.scale(ratio, ratio); ctx.translate(margin.left, margin.top)

  // hover overlay canvas (magenta highlight)
  var hctxSel = plotSel.append('canvas.hi')
    .at({width: cvW * ratio, height: totalH * ratio})
    .st({width: cvW + 'px', height: totalH + 'px'})
  var hctx = hctxSel.node().getContext('2d')
  hctx.scale(ratio, ratio); hctx.translate(margin.left, margin.top)

  // svg overlay (legend, axes, hover hit-rect) — sits on top of the canvases
  var svg = plotSel.append('svg')
    .at({width: cvW, height: totalH})
    .append('g').translate([margin.left, margin.top])
  var c = {svg: svg}   // keep the rest of the code's c.svg references working

  // ---- colour scales ----
  var AGE_MAX = 45
  var ageScale = d3.scaleLinear().domain([0, AGE_MAX]).range([0, 1]).clamp(true)
  var GREY_OG = '#e4e4e4'
  function turbo(t){
    t = t < 0 ? 0 : t > 1 ? 1 : t
    var r = 0.13572138 + t*(4.61539260 + t*(-42.66032258 + t*(132.13108234 + t*(-152.94239396 + t*59.28637943))))
    var g = 0.09140261 + t*(2.19418839 + t*(4.84296658 + t*(-14.18503333 + t*(4.27729857 + t*2.82956604))))
    var b = 0.10667330 + t*(12.64194608 + t*(-60.58204836 + t*(110.36276771 + t*(-89.90310912 + t*27.34824973))))
    function cc(v){ return Math.round(255*(v < 0 ? 0 : v > 1 ? 1 : v)) }
    return 'rgb(' + cc(r) + ',' + cc(g) + ',' + cc(b) + ')'
  }
  var decades = [1960, 1970, 1980, 1990, 2000, 2010, 2020]
  var decadeColor = {1960:'#1d3557', 1970:'#2a6f97', 1980:'#2a9d8f', 1990:'#8ab17d', 2000:'#e9c46a', 2010:'#f4a261', 2020:'#e76f51'}
  function decOf(ey){ return Math.max(1960, Math.min(2020, Math.floor(ey / 10) * 10)) }
  function colorFor(m){
    if (m.isPre) return GREY_OG
    return mode === 'age' ? turbo(ageScale(m.ten)) : decadeColor[decOf(m.entry)]
  }

  // ---- cells ----
  ctx.clearRect(0, 0, W, H)

  var colEdges = (function(){
    var e = new Array(columns.length + 1)
    e[0] = Math.round(x(columns[0].year) - colW / 2)
    for (var i = 1; i < columns.length; i++) e[i] = Math.round((x(columns[i-1].year) + x(columns[i].year)) / 2)
    e[columns.length] = Math.round(x(columns[columns.length-1].year) + colW / 2)
    return e
  })()
  function cellX(ci){ var x0 = colEdges[ci]; return {x0: x0, w: Math.max(1, colEdges[ci+1] - x0)} }
  function cellY(r){ var t = Math.round(H - (r+1)*cellH), b = Math.round(H - r*cellH); return {y: t, h: Math.max(1, b - t)} }

  columns.forEach(function(col, ci){
    var gx = cellX(ci)
    for (var r = 0; r < col.m.length; r++){ var gy = cellY(r); ctx.fillStyle = colorFor(col.m[r]); ctx.fillRect(gx.x0, gy.y, gx.w, gy.h) }
  })

  // ---- axes + labels ----
  // Adam's ggplot style: no heavy domain line, small grey ticks + labels. We set
  // styles inline via .st()/.at() so they override style.css (which hides
  // `.hm-axis line` and would otherwise drop the tick marks entirely), making the
  // year x-axis clearly visible along the bottom of the heatmap.
  var xTickYears = []; for (var yy = 1970; yy <= 2020; yy += 10) xTickYears.push(yy)
  var xAxisG = c.svg.append('g.hm-axis').translate([0, H])
  xAxisG.appendMany('g.hm-x-tick', xTickYears)
    .translate(function(d){ return [x(d), 0] })
    .each(function(d){
      var g = d3.select(this)
      g.append('line')
        .at({y1: 0, y2: 6})
        .st({display: 'inline', stroke: '#d8d8d8', strokeWidth: 1})   // override .hm-axis line{display:none}
      g.append('text.hm-x-label').text(d)
        .at({y: 18, textAnchor: 'middle'})
        .st({fontSize: '11px', fill: '#8a8a8a'})
    })
  // make sure no stray axis domain line shows
  xAxisG.selectAll('.domain').st({display: 'none', stroke: 'none'})
  c.svg.append('text.hm-y-title').text('↑ longer-tenured  ·  newer ↓')
    .at({textAnchor: 'middle', transform: 'rotate(-90)'}).attr('x', -H / 2).attr('y', -margin.left + 12)

  // ---- legend (switches with mode) ----
  var legG = c.svg.append('g.hm-legend').translate([0, -margin.top + 14])
  if (mode === 'age'){
    var legW = isMobile ? 150 : 210, legX = W - legW, legH = 9, steps = 60
    legG.translate([legX, -margin.top + 14])
    for (var s2 = 0; s2 < steps; s2++){ var f = s2/(steps-1); legG.append('rect').at({x: f*legW, y: 0, width: legW/steps+0.6, height: legH, fill: turbo(ageScale(f*AGE_MAX))}) }
    legG.append('text.hm-legend-title').text('age in index').at({x: legW, y: -5, textAnchor: 'end'})
    legG.append('rect').at({x: -16, y: 0, width: legH, height: legH, fill: GREY_OG})
    ;[[0,'0 yr'],[15,'15'],[30,'30'],[45,'45+']].forEach(function(d){ var ff = d[0]/AGE_MAX, a = d[0]===0?'start':(d[0]>=AGE_MAX?'end':'middle'); legG.append('text.hm-legend-tick').text(d[1]).at({x: ff*legW, y: legH+11, textAnchor: a}) })
  } else {
    var items = [['OG', GREY_OG]].concat(decades.map(function(d){ return [(d%100)+'s', decadeColor[d]] }))
    var sw = isMobile ? 46 : 58, lw = items.length * sw, lx = W - lw
    legG.translate([lx, -margin.top + 14])
    items.forEach(function(it, i){
      legG.append('rect').at({x: i*sw, y: 0, width: 9, height: 9, fill: it[1]})
      legG.append('text.hm-legend-tick').text(it[0]).at({x: i*sw + 12, y: 8})
    })
    legG.append('text.hm-legend-title').text('decade joined').at({x: lw, y: -5, textAnchor: 'end'})
  }

  // ================= HOVER: magenta highlight, no fade =================
  var ttSel = window.ttSel
  var HI = '#f0f'
  var hiId = null
  // clear the WHOLE canvas (incl. margins) so boxes near the edges don't pile up
  function clearAll(){ hctx.clearRect(-margin.left, -margin.top, cvW, totalH) }
  function clearHi(){ if (hiId === null) return; hiId = null; clearAll() }
  function drawHi(id){
    if (id === hiId) return
    hiId = id
    clearAll()
    var rows = idRows[id] || []
    if (!rows.length) return
    // 1px cells -> draw a small FILLED magenta box on each cell the firm occupies
    // (one per quarter; the trail breaks where it left and re-joined). No stroke.
    var BOX = 4
    rows.forEach(function(p){
      var gx = cellX(p.ci), gy = cellY(p.r)
      var x0 = Math.round(gx.x0 + gx.w / 2 - BOX / 2), y0 = Math.round(gy.y + gy.h / 2 - BOX / 2)
      hctx.fillStyle = '#fff'; hctx.fillRect(x0 - 1, y0 - 1, BOX + 2, BOX + 2)  // white halo (fill)
      hctx.fillStyle = HI;     hctx.fillRect(x0, y0, BOX, BOX)                   // magenta box
    })
  }

  var hit = c.svg.append('rect').at({width: W, height: H, fill: 'none', 'pointer-events': 'all'})
  function findColumn(px){
    var yr = x.invert(px), lo = 0, hi = columns.length - 1
    while (lo < hi){ var mid = (lo+hi)>>1; if (columns[mid].year < yr) lo = mid+1; else hi = mid }
    if (lo > 0 && Math.abs(columns[lo-1].year - yr) < Math.abs(columns[lo].year - yr)) lo = lo-1
    return lo
  }
  function hideTip(){ ttSel.classed('tooltip-hidden', true); clearHi() }
  hit.on('mousemove', function(){
      var pt = d3.mouse(this), px = pt[0], py = pt[1]
      if (px < 0 || px > W || py < 0 || py > H) return hideTip()
      var col = columns[findColumn(px)]
      var r = Math.floor((H - py) / cellH)
      if (r < 0 || r >= col.n) return hideTip()
      var m = col.m[r]
      drawHi(m.id)
      // name (bold) + ticker (if present) + joined + left/still-in + tenure
      var nm = m.name || m.ticker || m.id
      var joinedTxt = m.isPre ? 'before 1962' : Math.floor(m.entry)
      var stillIn = m.exit != null && m.exit >= STILL_IN
      var leftTxt = stillIn ? 'still in' : Math.floor(m.exit)
      var ten = Math.max(0, m.isPre ? (col.year - floor) : (col.year - m.entry))
      // .tt-tick is the bold/dark/13px primary line in style.css -> use it for the
      // company name; ticker drops to a lighter .tt-row below it when present.
      var html =
        '<div class="tt-tick">' + nm + '</div>' +
        (m.ticker ? '<div class="tt-row">' + m.ticker + '</div>' : '') +
        '<div class="tt-row">joined <b>' + joinedTxt + '</b></div>' +
        '<div class="tt-row">' + (stillIn ? '<b>still in</b>' : 'left <b>' + leftTxt + '</b>') + '</div>' +
        '<div class="tt-row">tenure <b>' + ten.toFixed(1) + ' yrs</b></div>' +
        '<div class="tt-q">' + col.q + '</div>'
      ttSel.classed('tooltip-hidden', false).html(html)
      // .sp500-tt is position:fixed, so anchor to the viewport (clientX/Y), not the page.
      var tw = 178, off = 14, mx = d3.event.clientX, my = d3.event.clientY
      var lft = mx + off
      if (lft + tw > window.innerWidth) lft = mx - off - tw
      ttSel.st({left: lft + 'px', top: (my + off) + 'px'})
    })
    .on('mouseout', hideTip)
}
