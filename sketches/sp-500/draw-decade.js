// Canvas stacked heatmap: x = quarter, y = rank within column (newest bottom,
// oldest top). Each member cell coloured by the DECADE of entry_year; grey if
// entry_year is null or <= floor (OG / pre-1962). Median-tenure dashed line.
window.drawDecade = function(data){
  var sel = d3.select('.c-decade .chart').html('')
  if (!data || !data.columns || !data.columns.length) return

  var OG_FLOOR = data.floor   // entry_year null or <= this => original / pre-1962 (grey)

  // decade-of-entry cohorts. distinct hues, oldest cool -> newest warm.
  var cohorts = [
    {min: 1960, max: 1970, label: '1960s', color: '#1d3557'},
    {min: 1970, max: 1980, label: '1970s', color: '#2a6f97'},
    {min: 1980, max: 1990, label: '1980s', color: '#2a9d8f'},
    {min: 1990, max: 2000, label: '1990s', color: '#8ab17d'},
    {min: 2000, max: 2010, label: '2000s', color: '#e9c46a'},
    {min: 2010, max: 2020, label: '2010s', color: '#f4a261'},
    {min: 2020, max: Infinity, label: '2020s', color: '#e76f51'}
  ]
  var OG_COLOR = '#bdbdbd'

  function isOG(ey){ return ey === null || ey === undefined || ey <= OG_FLOOR }
  function cohortFor(ey){
    for (var i = 0; i < cohorts.length; i++){
      if (ey >= cohorts[i].min && ey < cohorts[i].max) return cohorts[i]
    }
    return cohorts[cohorts.length - 1]
  }

  var columns = data.columns
  var maxMembers = d3.max(columns, function(c){ return c.length })
  var isMobile = window.innerWidth < 620

  sel.append('div.subhead').text('Members stacked by tenure, coloured by decade joined')

  var totalWidth = Math.min(sel.node().clientWidth || (window.innerWidth - 32), 940)
  var margin = isMobile
    ? {top: 22, right: 12, bottom: 40, left: 40}
    : {top: 24, right: 24, bottom: 44, left: 58}
  var height = isMobile ? 380 : 520
  var width = totalWidth - margin.left - margin.right

  var plot = sel.append('div.plot')
    .st({width: totalWidth + 'px', height: (height + margin.top + margin.bottom) + 'px'})

  // ---- scales ----
  var years = columns.map(function(d){ return d.t })
  var x = d3.scaleLinear()
    .domain([d3.min(years), d3.max(years)])
    .range([0, width])

  // y: rank within column (0 = newest/bottom) -> px. newest at bottom => large y.
  var y = d3.scaleLinear()
    .domain([0, maxMembers])
    .range([height, 0])

  var colW = width / columns.length
  var cellW = Math.ceil(colW) + 1
  var rowH = height / maxMembers
  var cellH = Math.ceil(rowH) + 0.6

  // ---- canvas grid ----
  var ratio = window.devicePixelRatio || 1
  var canvas = plot.append('canvas')
    .at({width: width * ratio, height: height * ratio})
    .st({
      width: width + 'px', height: height + 'px',
      left: margin.left + 'px', top: margin.top + 'px'
    })
    .node()
  var ctx = canvas.getContext('2d')
  ctx.scale(ratio, ratio)

  columns.forEach(function(col){
    var px = x(col.t)
    for (var i = 0; i < col.length; i++){
      var ey = col[i].entry_year
      var py = y(i)   // top of this row (i = 0 is newest, at the bottom)
      ctx.fillStyle = isOG(ey) ? OG_COLOR : cohortFor(ey).color
      ctx.fillRect(px, py - cellH, cellW, cellH)
    }
  })

  // ---- svg overlay ----
  var svg = plot.append('svg')
    .at({width: totalWidth, height: height + margin.top + margin.bottom})
  var gAxis = svg.append('g').translate([margin.left, margin.top])

  // x labels: every 10 years
  var xTickYears = []
  for (var yr = 1965; yr <= 2025; yr += 10) xTickYears.push(yr)

  gAxis.appendMany('text.x-label', xTickYears)
    .text(function(d){ return "'" + String(d).slice(2) })
    .at({x: function(d){ return x(d) }, y: height + 18, textAnchor: 'middle'})
  gAxis.appendMany('line.x-tick', xTickYears)
    .at({
      x1: function(d){ return x(d) }, x2: function(d){ return x(d) },
      y1: height + 2, y2: height + 7
    })

  // y captions
  gAxis.append('text.axis-caption')
    .text('longer tenure  ↑')
    .at({x: -margin.left + 2, y: -8, textAnchor: 'start'})
  gAxis.append('text.axis-caption')
    .text('newest entrants  ↓')
    .at({x: -margin.left + 2, y: height - 6, textAnchor: 'start'})

  // ---- median-tenure line ----
  var medianPts = columns.map(function(col){
    var rank = Math.floor(col.length / 2)
    return {t: col.t, rank: rank}
  })
  var medLine = d3.line()
    .x(function(d){ return x(d.t) })
    .y(function(d){ return y(d.rank) })
    .curve(d3.curveBasis)
  gAxis.append('path.median')
    .at({d: medLine(medianPts)})

  if (!isMobile){
    var annT = 1991
    var annPt = medianPts.reduce(function(a, b){
      return Math.abs(b.t - annT) < Math.abs(a.t - annT) ? b : a
    })
    gAxis.append('text.annotation')
      .text('median tenure')
      .at({x: x(annT) + 6, y: y(annPt.rank) - 16, textAnchor: 'start'})
  }

  drawLegend(gAxis, width, isMobile)

  // ---- hit-testing tooltip ----
  d3.select(canvas)
    .on('mousemove', function(){
      var pt = d3.mouse(this)
      var mx = pt[0], my = pt[1]
      if (mx < 0 || mx > width || my < 0 || my > height){
        window.ttSel.classed('tooltip-hidden', 1); return
      }
      var ci = Math.round((mx / width) * (columns.length - 1))
      ci = Math.max(0, Math.min(columns.length - 1, ci))
      var col = columns[ci]
      var rank = Math.floor(y.invert(my))
      if (rank < 0 || rank >= col.length){
        window.ttSel.classed('tooltip-hidden', 1); return
      }
      var cell = col[rank]
      var ey = cell.entry_year
      var og = isOG(ey)
      var coh = og ? null : cohortFor(ey)
      var dotColor = og ? OG_COLOR : coh.color
      var tickerLabel = cell.ticker ? cell.ticker : '(unlisted member)'
      var joinedStr = og ? 'before 1962' : (coh.label + ' · ' + Math.round(ey))

      window.ttSel.classed('tooltip-hidden', 0).html(
        '<div class="tt-ticker">' +
          '<span class="tt-dot" style="background:' + dotColor + '"></span>' + tickerLabel +
        '</div>' +
        '<div>joined <b>' + joinedStr + '</b></div>' +
        '<div class="tt-sub">' + cell.tenure.toFixed(1) + ' years in the index</div>' +
        '<div class="tt-q">' + col.q + '</div>'
      )
      var e = d3.event
      window.ttSel.st({left: (e.pageX + 16) + 'px', top: (e.pageY - 12) + 'px'})
    })
    .on('mouseout', function(){ window.ttSel.classed('tooltip-hidden', 1) })

  function drawLegend(g, width, isMobile){
    var lw = isMobile ? 112 : 132
    var rH = isMobile ? 15 : 16
    var sw = 11
    var lx = width - lw
    var ly = isMobile ? 4 : 6

    var leg = g.append('g.legend').translate([lx, ly])

    var items = cohorts.slice().reverse()
      .concat([{label: 'before 1962', color: OG_COLOR}])

    // white backing panel so labels read over the canvas
    leg.append('rect.legend-bg')
      .at({
        x: -8, y: -22,
        width: lw + 12, height: items.length * rH + 28,
        rx: 4
      })

    leg.append('text.legend-title')
      .text('decade joined')
      .at({x: 0, y: -6})

    var row = leg.appendMany('g', items)
      .translate(function(d, i){ return [0, i * rH] })

    row.append('rect.swatch')
      .at({x: 0, y: 0, width: sw, height: sw, rx: 2,
        fill: function(d){ return d.color }})

    row.append('text.legend-label')
      .text(function(d){ return d.label })
      .at({x: sw + 5, y: sw - 2})
  }
}
