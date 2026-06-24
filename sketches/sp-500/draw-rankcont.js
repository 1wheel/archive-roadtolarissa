// Canvas heatmap of S&P 500 membership: x = quarter, y = rank (newest at the
// bottom), colour = age/tenure on a fixed turbo scale; grey for undatable
// pre-1962 OG members, forced to the top of every column. Hover traces one
// ticker across every quarter it appears in. Re-runnable on resize.
window.drawRankcont = function(data){
  var floor = data.floor
  var isMobile = window.innerWidth < 620

  var sel = d3.select('.c-rankcont .chart').html('')

  sel.append('div.rc-subhead').text('Members by tenure, coloured by age')

  // ---- build per-column member objects + cross-time trace index ----
  // data.columns are nestBy arrays (tenure asc) of {q,t,ticker,entry_year,tenure}.
  // We re-shape into light cell objects, force grey OG members to the TOP of each
  // column (young at bottom -> old below grey), and index traceable tickers at
  // their FINAL rank so hover can outline a firm across the whole time axis.
  var columns = data.columns.map(function(c, ci){
    var year = c.t
    var m = c.map(function(row){
      var ey = row.entry_year
      if (ey === undefined || (typeof ey == 'number' && isNaN(ey))) ey = null
      var ticker = row.ticker == null ? '' : row.ticker
      var isPre = ey === null || ey <= floor             // undatable -> grey
      var d = {
        ticker: ticker,
        ey: ey === null ? floor : ey,
        entry: ey,
        isPre: isPre,
        isUnknown: ticker === '?',                       // pre-2000 unmapped
        isAnon: ticker === '' || ticker === '?',         // not traceable
        ten: Math.max(0, year - (ey === null ? floor : ey))
      }
      return d
    })
    return {q: c.q, year: year, idx: ci, m: m, n: m.length}
  })

  var tickerRows = {}
  columns.forEach(function(c){
    c.m.sort(function(a, b){
      if (a.isPre !== b.isPre) return a.isPre ? 1 : -1   // grey OG always on top
      return a.ten - b.ten                                // young bottom -> old top
    })
    c.m.forEach(function(d, r){
      if (!d.isAnon){
        ;(tickerRows[d.ticker] || (tickerRows[d.ticker] = [])).push({ci: c.idx, r: r})
      }
    })
  })

  // ---- layout ----
  var totalWidth = Math.min(window.innerWidth - 32, 960)
  var margin = isMobile
    ? {top: 30, right: 14, bottom: 40, left: 38}
    : {top: 38, right: 24, bottom: 44, left: 52}
  var height = isMobile
    ? 460
    : Math.max(620, Math.min(720, Math.round(window.innerHeight * 0.72)))

  var plotSel = sel.append('div.rc-plot')
  var c = d3.conventions({
    sel: plotSel.append('svg'),
    totalWidth: totalWidth,
    height: height,
    margin: margin
  })
  var W = c.width
  var H = c.height

  // x: decimal year; y: rank (0 = newest at bottom)
  var years = columns.map(function(d){ return d.year })
  var x = d3.scaleLinear().domain([d3.min(years), d3.max(years)]).range([0, W])
  var colW = W / (columns.length - 1)
  var maxN = d3.max(columns, function(d){ return d.n })
  var cellH = H / maxN

  // ---- colour: fixed turbo by age (0..45yr), grey for undatable OG ----
  var AGE_MAX = 45
  var ageScale = d3.scaleLinear().domain([0, AGE_MAX]).range([0, 1]).clamp(true)
  var GREY_OG = '#c9c9c9'
  function turbo(t){
    t = t < 0 ? 0 : t > 1 ? 1 : t
    var r = 0.13572138 + t*(4.61539260 + t*(-42.66032258 + t*(132.13108234 + t*(-152.94239396 + t*59.28637943))))
    var g = 0.09140261 + t*(2.19418839 + t*(4.84296658 + t*(-14.18503333 + t*(4.27729857 + t*2.82956604))))
    var b = 0.10667330 + t*(12.64194608 + t*(-60.58204836 + t*(110.36276771 + t*(-89.90310912 + t*27.34824973))))
    function cc(v){ return Math.round(255*(v < 0 ? 0 : v > 1 ? 1 : v)) }
    return 'rgb(' + cc(r) + ',' + cc(g) + ',' + cc(b) + ')'
  }
  function colorForTen(ten){ return turbo(ageScale(ten)) }
  function colorFor(m){ return m.isPre ? GREY_OG : turbo(ageScale(m.ten)) }

  // ---- base canvas ----
  var ratio = window.devicePixelRatio || 1
  function mkCanvas(cls){
    var s = plotSel.insert('canvas' + (cls ? '.' + cls : ''), 'svg')
      .at({width: W * ratio, height: H * ratio})
      .st({width: W + 'px', height: H + 'px', left: margin.left + 'px', top: margin.top + 'px'})
    var cx = s.node().getContext('2d')
    cx.scale(ratio, ratio)
    return cx
  }
  var ctx = mkCanvas()
  ctx.clearRect(0, 0, W, H)
  var hctx = mkCanvas('hi')   // transparent overlay for the hover trace

  // gap-free column edges (shared edges tile the field with no white seams)
  var colEdges = (function(){
    var edges = new Array(columns.length + 1)
    edges[0] = Math.round(x(columns[0].year) - colW / 2)
    for (var i = 1; i < columns.length; i++){
      edges[i] = Math.round((x(columns[i - 1].year) + x(columns[i].year)) / 2)
    }
    edges[columns.length] = Math.round(x(columns[columns.length - 1].year) + colW / 2)
    return edges
  })()
  function cellX(ci){ var x0 = colEdges[ci]; return {x0: x0, w: Math.max(1, colEdges[ci + 1] - x0)} }
  function cellY(r){
    var yTop = Math.round(H - (r + 1) * cellH)
    var yBot = Math.round(H - r * cellH)
    return {y: yTop, h: Math.max(1, yBot - yTop)}
  }

  // paint cells
  columns.forEach(function(col, ci){
    var gx = cellX(ci)
    var m = col.m
    for (var r = 0; r < m.length; r++){
      var gy = cellY(r)
      ctx.fillStyle = colorFor(m[r])
      ctx.fillRect(gx.x0, gy.y, gx.w, gy.h)
    }
  })

  // ================= SVG OVERLAY =================
  var xTickYears = []
  for (var yy = 1970; yy <= 2020; yy += 10) xTickYears.push(yy)
  c.svg.append('g.rc-axis').translate([0, H])
    .appendMany('g.rc-x-tick', xTickYears)
    .translate(function(d){ return [x(d), 0] })
    .each(function(d){
      var g = d3.select(this)
      g.append('line').at({y1: 0, y2: 6, stroke: '#bbb'})
      g.append('text.rc-x-label').text(d).at({y: 18, textAnchor: 'middle'})
    })

  c.svg.append('text.rc-y-title')
    .text('↑ longer-tenured  ·  newer ↓')
    .at({textAnchor: 'middle', transform: 'rotate(-90)'})
    .attr('x', -H / 2)
    .attr('y', -margin.left + 12)

  // one neutral label: the grey band marks pre-1962 members
  if (!isMobile){
    c.svg.append('text.rc-anno')
      .at({x: x(1986), y: H * 0.085, textAnchor: 'middle'})
      .text('grey = in before 1962')
  }

  // ---- legend (age ramp + grey OG swatch) ----
  var legW = isMobile ? 150 : 210
  var legH = 9
  var legX = W - legW
  var legY = -margin.top + 14
  var legSteps = 60
  var legG = c.svg.append('g.rc-legend').translate([legX, legY])
  for (var s2 = 0; s2 < legSteps; s2++){
    var f = s2 / (legSteps - 1)
    legG.append('rect').at({x: f * legW, y: 0, width: legW / legSteps + 0.6, height: legH, fill: colorForTen(f * AGE_MAX)})
  }
  legG.append('text.rc-legend-title')
    .text('age in index  ·  grey = OG')
    .at({x: legW, y: -5, textAnchor: 'end'})
  legG.append('rect').at({x: -16, y: 0, width: legH, height: legH, fill: GREY_OG})
  ;[[0, '0 yr'], [15, '15'], [30, '30'], [45, '45+']].forEach(function(d){
    var ff = d[0] / AGE_MAX
    var anchor = d[0] === 0 ? 'start' : (d[0] >= AGE_MAX ? 'end' : 'middle')
    legG.append('text.rc-legend-tick').text(d[1]).at({x: ff * legW, y: legH + 11, textAnchor: anchor})
  })

  // ================= HOVER HIGHLIGHT (overlay canvas) =================
  var ttSel = window.ttSel
  var hiTicker = null

  function clearHi(){
    if (hiTicker === null) return
    hiTicker = null
    hctx.clearRect(0, 0, W, H)
  }

  function drawHi(ticker, hoverCi){
    if (ticker === hiTicker) return
    hiTicker = ticker
    hctx.clearRect(0, 0, W, H)

    hctx.fillStyle = 'rgba(255,255,255,0.55)'   // scrim
    hctx.fillRect(0, 0, W, H)

    var rows = tickerRows[ticker] || []
    rows.forEach(function(p){                    // punch firm's cells back to full colour
      var gx = cellX(p.ci), gy = cellY(p.r)
      hctx.fillStyle = colorFor(columns[p.ci].m[p.r])
      hctx.fillRect(gx.x0, gy.y, gx.w, gy.h)
    })

    hctx.lineWidth = 1
    hctx.strokeStyle = 'rgba(20,30,45,0.85)'
    rows.forEach(function(p){
      var gx = cellX(p.ci), gy = cellY(p.r)
      hctx.strokeRect(gx.x0 + 0.5, gy.y + 0.5, gx.w - 1, gy.h - 1)
    })

    var hgx = cellX(hoverCi), hr = null
    for (var i = 0; i < rows.length; i++){ if (rows[i].ci === hoverCi){ hr = rows[i].r; break } }
    if (hr !== null){
      var hgy = cellY(hr), pad = 1.5
      hctx.lineWidth = 1.5
      hctx.strokeStyle = '#111'
      hctx.strokeRect(hgx.x0 - pad + 0.5, hgy.y - pad + 0.5, hgx.w + pad * 2 - 1, hgy.h + pad * 2 - 1)
    }
  }

  // ================= TOOLTIP / HIT TESTING =================
  var hit = c.svg.append('rect').at({width: W, height: H, fill: 'none', 'pointer-events': 'all'})

  function findColumn(px){
    var yr = x.invert(px)
    var lo = 0, hi = columns.length - 1
    while (lo < hi){
      var mid = (lo + hi) >> 1
      if (columns[mid].year < yr) lo = mid + 1
      else hi = mid
    }
    if (lo > 0 && Math.abs(columns[lo - 1].year - yr) < Math.abs(columns[lo].year - yr)) lo = lo - 1
    return lo
  }

  function hideTip(){ ttSel.classed('tooltip-hidden', true); clearHi() }

  hit
    .on('mousemove', function(){
      var pt = d3.mouse(this)
      var px = pt[0], py = pt[1]
      if (px < 0 || px > W || py < 0 || py > H){ return hideTip() }
      var col = columns[findColumn(px)]
      var r = Math.floor((H - py) / cellH)
      if (r < 0 || r >= col.n){ return hideTip() }
      var member = col.m[r]

      if (member.isAnon){
        clearHi()                                // anonymous/unidentified -> no trace
        var label = member.isUnknown
          ? '<div class="tt-tick">unidentified S&amp;P member</div><div class="tt-row">pre-2000</div>'
          : '<div class="tt-tick">OG (pre-1962)</div><div class="tt-row">in since <b>before 1962</b></div>'
        ttSel.classed('tooltip-hidden', false).html(label + '<div class="tt-q">' + col.q + '</div>')
      } else {
        var joinedTxt = member.isPre ? 'before 1962' : Math.floor(member.entry)
        var ten = Math.max(0, member.isPre ? (col.year - floor) : (col.year - member.entry))
        var tenTxt = ten.toFixed(1) + ' yr' + (ten >= 1.95 || ten < 1 ? 's' : '')
        drawHi(member.ticker, col.idx)
        ttSel.classed('tooltip-hidden', false).html(
          '<div class="tt-tick">' + member.ticker + '</div>' +
          '<div class="tt-row">joined <b>' + joinedTxt + '</b></div>' +
          '<div class="tt-row">tenure <b>' + tenTxt + '</b></div>' +
          '<div class="tt-q">' + col.q + '</div>'
        )
      }

      var tw = 150, off = 14
      var lft = d3.event.pageX + off
      if (lft + tw > window.innerWidth) lft = d3.event.pageX - off - tw
      ttSel.st({left: lft + 'px', top: (d3.event.pageY + off) + 'px'})
    })
    .on('mouseout', hideTip)
}
