// Canvas Marey of S&P 500 membership spans.
// Two stacked panels share one year axis (1962-2026); each company is a 1px
// hairline from enter_t to exit_t. Panel A sorted by entry, Panel B by exit.
// Colour by tenure (turbo); grey if OG (in the index before 1962).
window.drawMarey = function(data){
  var sel = d3.select('.c-marey .chart').html('')

  var isMobile = window.innerWidth < 620

  // ---- spans + derived still-in flag (exit_t = lastQuarter + 0.25) ----
  var spans = data.spans.map(function(d){
    return {
      ticker: d.ticker,
      entry: d.entry,
      enter_t: d.enter_t,
      exit_t: d.exit_t,
      og: d.og,
      tenure: Math.max(0, d.tenure),
      stillIn: d.exit_t >= 2026.0
    }
  })

  // pre-sort each panel's row order
  var byEntry = spans.slice().sort(function(a, b){
    var ea = a.og ? -1 : a.entry, eb = b.og ? -1 : b.entry
    return ea - eb || a.exit_t - b.exit_t
  })
  var byExit = spans.slice().sort(function(a, b){
    return a.exit_t - b.exit_t || (a.og ? -1 : a.entry) - (b.og ? -1 : b.entry)
  })

  // ---- turbo colormap (inlined; not in the d3 bundle) ----
  function turbo(t){
    t = t < 0 ? 0 : t > 1 ? 1 : t
    var r = 0.13572138 + t*(4.61539260 + t*(-42.66032258 + t*(132.13108234 + t*(-152.94239396 + t*59.28637943))))
    var g = 0.09140261 + t*(2.19418839 + t*(4.84296658 + t*(-14.18503333 + t*(4.27729857 + t*2.82956604))))
    var b = 0.10667330 + t*(12.64194608 + t*(-60.58204836 + t*(110.36276771 + t*(-89.90310912 + t*27.34824973))))
    function cc(x){ return Math.round(255*(x < 0 ? 0 : x > 1 ? 1 : x)) }
    return 'rgb(' + cc(r) + ',' + cc(g) + ',' + cc(b) + ')'
  }

  var totalWidth = Math.min(window.innerWidth - 32, 960)
  var margin = {top: 12, right: 18, bottom: 28, left: 16}
  var W = totalWidth - margin.left - margin.right
  var panelH = isMobile ? 260 : 340

  // shared x scale: decimal year
  var x = d3.scaleLinear().domain([1962, 2026.5]).range([0, W])

  // colour: tenure ramp, capped so 45+yr reads deepest. OG = grey.
  var TEN_MAX = 45
  var tenScale = d3.scaleLinear().domain([0, TEN_MAX]).range([0, 1]).clamp(true)
  var GREY_OG = '#bdbdbd'
  function colorFor(d){ return d.og ? GREY_OG : turbo(tenScale(d.tenure)) }

  // shared decade x-ticks
  var xTickYears = []
  for (var yy = 1970; yy <= 2020; yy += 10) xTickYears.push(yy)

  function buildPanel(opts){
    var rows = opts.rows
    var n = rows.length
    var H = panelH
    var rowH = H / n
    var ratio = window.devicePixelRatio || 1
    // crisp 1-device-pixel hairlines: snap each line's centre to a device-pixel row
    var lineY = function(i){
      var yDev = Math.round((i * rowH + rowH / 2) * ratio)
      return (yDev + 0.5) / ratio
    }

    var plotSel = sel.append('div.plot')

    var totalH = H + margin.top + margin.bottom
    var cvW = W + margin.left + margin.right

    // --- base canvas: ~1330 thin lines ---
    var canvasSel = plotSel.append('canvas')
      .at({width: cvW * ratio, height: totalH * ratio})
      .st({width: cvW + 'px', height: totalH + 'px'})
    var ctx = canvasSel.node().getContext('2d')
    ctx.scale(ratio, ratio)
    ctx.translate(margin.left, margin.top)
    ctx.clearRect(-margin.left, -margin.top, cvW, totalH)
    ctx.lineWidth = 1 / ratio
    ctx.lineCap = 'butt'
    rows.forEach(function(d, i){
      var y = lineY(i)
      var x0 = x(d.enter_t)
      var x1 = x(d.exit_t)
      ctx.strokeStyle = colorFor(d)
      ctx.beginPath()
      ctx.moveTo(x0, y)
      ctx.lineTo(Math.max(x1, x0 + 0.8), y)
      ctx.stroke()
    })

    // --- highlight overlay canvas ---
    var hiSel = plotSel.append('canvas.hi')
      .at({width: cvW * ratio, height: totalH * ratio})
      .st({width: cvW + 'px', height: totalH + 'px'})
    var hctx = hiSel.node().getContext('2d')
    hctx.scale(ratio, ratio)
    hctx.translate(margin.left, margin.top)

    // --- svg overlay (axis + label + hover) ---
    var svg = plotSel.append('svg')
      .at({width: cvW, height: totalH})
      .append('g').translate([margin.left, margin.top])

    // x axis along the bottom
    var xAxisG = svg.append('g.axis').translate([0, H])
    xAxisG.appendMany('g.x-tick', xTickYears)
      .translate(function(d){ return [x(d), 0] })
      .each(function(d){
        var g = d3.select(this)
        g.append('line').at({y1: 0, y2: 6, stroke: '#bbb'})
        g.append('text.x-label').text(d).at({y: 18, textAnchor: 'middle'})
      })

    // one neutral hand-placed label per panel
    svg.append('text.panel-label')
      .text(opts.label)
      .at({x: 2, y: 13})

    // ================= HOVER =================
    var hit = svg.append('rect')
      .at({width: W, height: H, fill: 'none', 'pointer-events': 'all'})

    var hiIdx = -1
    function clearHi(){
      if (hiIdx < 0) return
      hiIdx = -1
      hctx.clearRect(-margin.left, -margin.top, cvW, totalH)
    }
    function drawHi(i){
      if (i === hiIdx) return
      hiIdx = i
      hctx.clearRect(-margin.left, -margin.top, cvW, totalH)
      var d = rows[i]
      var y = lineY(i)
      hctx.lineWidth = 3
      hctx.strokeStyle = '#111'
      hctx.beginPath()
      hctx.moveTo(x(d.enter_t), y)
      hctx.lineTo(Math.max(x(d.exit_t), x(d.enter_t) + 1), y)
      hctx.stroke()
    }

    hit
      .on('mousemove', function(){
        var pt = d3.mouse(this)
        var px = pt[0], py = pt[1]
        if (px < 0 || px > W || py < 0 || py > H) return hideTip()
        var i = Math.floor(py / rowH)
        if (i < 0 || i >= n) return hideTip()
        var d = rows[i]
        drawHi(i)

        var entTxt = d.og ? 'before 1962' : Math.floor(d.entry)
        var exitTxt = d.stillIn ? 'still in' : Math.floor(d.exit_t)
        var tk = d.ticker && d.ticker !== '?' ? d.ticker : '(unnamed)'
        window.ttSel.classed('tooltip-hidden', false).html(
          '<div class="tt-tick">' + tk + (d.og ? ' · joined before 1962' : '') + '</div>' +
          '<div class="tt-row">entered <b>' + entTxt + '</b></div>' +
          '<div class="tt-row">exited <b>' + exitTxt + '</b></div>' +
          '<div class="tt-row">tenure <b>' + d.tenure.toFixed(1) + ' yrs</b></div>'
        )
        var tw = 150, off = 14
        var lft = d3.event.pageX + off
        if (lft + tw > window.innerWidth) lft = d3.event.pageX - off - tw
        window.ttSel.st({left: lft + 'px', top: (d3.event.pageY + off) + 'px'})
      })
      .on('mouseout', hideTip)

    function hideTip(){ window.ttSel.classed('tooltip-hidden', true); clearHi() }
  }

  // short chart subtitle (<=6 words); page already has h1 + intro
  sel.append('div.marey-sub').text('Each hairline is one membership span')

  buildPanel({rows: byEntry, label: 'sorted by entry'})
  buildPanel({rows: byExit, label: 'sorted by exit'})

  // ---- tenure legend ----
  var legSel = sel.append('div.plot').st({height: '34px', marginTop: '8px'})
  var legW = isMobile ? 180 : 240, legH = 9
  var lsvg = legSel.append('svg').at({width: totalWidth, height: 34})
    .append('g').translate([margin.left, 8])
  var steps = 60
  for (var s = 0; s < steps; s++){
    var f = s / (steps - 1)
    lsvg.append('rect').at({x: f * legW, y: 0, width: legW / steps + 0.6, height: legH, fill: turbo(f)})
  }
  lsvg.append('rect').at({x: legW + 16, y: 0, width: legH, height: legH, fill: GREY_OG})
  lsvg.append('text.legend-tick').text('joined before 1962').at({x: legW + 30, y: legH})
  lsvg.append('text.legend-title').text('tenure (turbo)').at({x: 0, y: -1})
  ;[[0, '0'], [22, '22'], [45, '45+ yrs']].forEach(function(d){
    var f = d[0] / TEN_MAX
    var anchor = d[0] === 0 ? 'start' : (d[0] >= TEN_MAX ? 'end' : 'middle')
    lsvg.append('text.legend-tick').text(d[1]).at({x: f * legW, y: legH + 12, textAnchor: anchor})
  })
}
