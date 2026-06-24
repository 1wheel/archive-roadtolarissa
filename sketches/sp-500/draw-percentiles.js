// Decile line chart: years a company has been in the S&P 500 at each decile,
// per quarter 1963-2026. Median (p50) emphasised; each decile "pops in" only
// once it is measurable above the 1962 data floor (cens <= (100-p)/100).
window.drawPercentiles = function(data){
  var rows = data.pctSeries
  var pcts = data.pcts

  // decile styling, median emphasised; non-median deciles faint blue-grey.
  var pctMeta = {
    p90: {color: '#9fb4cc', width: 1.3, op: 0.85, label: '90th'},
    p80: {color: '#8ea7c2', width: 1.3, op: 0.85, label: '80th'},
    p70: {color: '#7d99b7', width: 1.3, op: 0.9,  label: '70th'},
    p60: {color: '#5d7ea6', width: 1.3, op: 0.9,  label: '60th'},
    p50: {color: '#1d3557', width: 3.0, op: 1,    label: 'median'},
    p40: {color: '#5d7ea6', width: 1.3, op: 0.9,  label: '40th'},
    p30: {color: '#7d99b7', width: 1.3, op: 0.9,  label: '30th'},
    p20: {color: '#8ea7c2', width: 1.3, op: 0.85, label: '20th'},
    p10: {color: '#9fb4cc', width: 1.3, op: 0.85, label: '10th'}
  }
  // draw order: non-median deciles first, median last (on top)
  var drawOrder = ['p90', 'p80', 'p70', 'p60', 'p40', 'p30', 'p20', 'p10', 'p50']
  // top-to-bottom (highest value -> lowest)
  var topDown = ['p90', 'p80', 'p70', 'p60', 'p50', 'p40', 'p30', 'p20', 'p10']

  var chartSel = d3.select('.c-percentiles .chart').html('')
  if (!chartSel.node()) return

  var measured = chartSel.node().getBoundingClientRect().width || window.innerWidth
  var availWidth = Math.min(measured, document.documentElement.clientWidth - 10)
  var isMobile = availWidth < 640

  var totalWidth = Math.min(availWidth, 940)
  var margin = isMobile
    ? {top: 34, right: 56, bottom: 40, left: 36}
    : {top: 38, right: 150, bottom: 48, left: 50}

  var c = d3.conventions({
    sel: chartSel,
    totalWidth: totalWidth,
    height: (isMobile ? 380 : 440) - margin.top - margin.bottom,
    margin: margin
  })

  // ---- scales ----
  var maxVal = d3.max(rows, function(d){ return d.p90 })
  c.x = d3.scaleLinear().domain([1962, 2027]).range([0, c.width])
  c.y = d3.scaleLinear().domain([0, Math.ceil(maxVal / 10) * 10]).range([c.height, 0]).nice()

  var yTicks = c.y.ticks(7)
  c.xAxis = d3.axisBottom(c.x).ticks(isMobile ? 5 : 8).tickFormat(d3.format('d'))
  c.yAxis = d3.axisLeft(c.y).tickValues(yTicks).tickFormat(function(d){ return d })

  // ---- gridlines ----
  c.svg.append('g.grid').lower().appendMany('line', yTicks)
    .at({y1: c.y, y2: c.y, x1: 0, x2: c.width, stroke: '#ededed', strokeWidth: 1})

  // A decile p is "measurable" in a quarter once the censored (pre-1962) share is
  // at or below (100 - p)/100; below that it's still pinned to the data floor.
  function measurable(key, d){
    var p = +key.slice(1)
    return d.cens <= (100 - p) / 100
  }
  // contiguous tail of rows where the decile is measurable (drawn solid).
  function measurableSpan(key){
    var firstMeas = -1
    for (var i = 0; i < rows.length; i++){
      if (measurable(key, rows[i])){ firstMeas = i; break }
    }
    return firstMeas == -1 ? [] : rows.slice(firstMeas)
  }

  // ---- p20-p80 faint band, only where both bounds are measurable ----
  var bandRows = rows.filter(function(d){ return measurable('p20', d) && measurable('p80', d) })
  if (bandRows.length > 1){
    var bandArea = d3.area()
      .x(function(d){ return c.x(d.t) })
      .y0(function(d){ return c.y(d.p20) })
      .y1(function(d){ return c.y(d.p80) })
    c.svg.append('path')
      .at({d: bandArea(bandRows), fill: '#1d3557', opacity: 0.05})
  }

  // ---- line generators per percentile ----
  function lineGen(key){
    return d3.line()
      .x(function(d){ return c.x(d.t) })
      .y(function(d){ return c.y(d[key]) })
  }

  drawOrder.forEach(function(k){
    var m = pctMeta[k]
    var solid = measurableSpan(k)
    if (solid.length > 1){
      c.svg.append('path')
        .at({d: lineGen(k)(solid), stroke: m.color, strokeWidth: m.width, fill: 'none',
          opacity: m.op, strokeLinejoin: 'round', strokeLinecap: 'round'})
    }
  })

  // ============ END LABELS (dodged) ============
  var last = rows[rows.length - 1]
  var lx = c.x(last.t)
  var annoSel = c.svg.append('g.anno')

  function endLabel(x, y, text, color, weight, size){
    annoSel.append('text').text(text)
      .at({x: x, y: y, textAnchor: 'start', fontSize: size || 11.5, fontWeight: weight || 600,
        fill: color, stroke: '#fff', strokeWidth: 2.8})
      .st({paintOrder: 'stroke'})
  }
  function leader(x1, y1, x2, y2){
    annoSel.append('line').at({x1: x1, y1: y1, x2: x2, y2: y2, stroke: '#bbb', strokeWidth: 0.75})
  }

  if (isMobile){
    var endY = {}
    topDown.forEach(function(k){ endY[k] = c.y(last[k]) })
    var minGapM = 12, prevM = -1e9
    topDown.forEach(function(k){
      var y = Math.max(endY[k], prevM + minGapM)
      endY[k] = y; prevM = y
    })
    topDown.forEach(function(k){
      var m = pctMeta[k]
      endLabel(lx + 5, endY[k] + 3.5, k.slice(1) + 'th', m.color, k == 'p50' ? 700 : 600, 10)
    })
  } else {
    var labels = topDown.map(function(k){
      return {k: k, m: pctMeta[k], y: c.y(last[k]), val: last[k]}
    })
    var minGap = 17, prev = -1e9
    labels.forEach(function(l){
      if (l.y < prev + minGap) l.y = prev + minGap
      prev = l.y
    })
    labels.forEach(function(l){
      var ty = l.y
      var dataY = c.y(l.val)
      var isMed = l.k == 'p50'
      leader(lx + 2, dataY, lx + 14, ty)
      var txt = isMed ? 'median' : l.m.label
      endLabel(lx + 18, ty + 4, txt, l.m.color, isMed ? 700 : 600, isMed ? 12.5 : 11)
      var vx = lx + 18 + (isMed ? 52 : 40)
      annoSel.append('text').text(l.val.toFixed(1))
        .at({x: vx, y: ty + 4, textAnchor: 'start', fontSize: isMed ? 11.5 : 10.5,
          fontWeight: isMed ? 700 : 400, fill: isMed ? '#1d3557' : '#888',
          stroke: '#fff', strokeWidth: 2.6}).st({paintOrder: 'stroke'})
    })
    annoSel.append('text').text('yrs')
      .at({x: lx + 18, y: labels[0].y - 12, textAnchor: 'start', fontSize: 9.5, fill: '#aaa'})
  }

  function rowAt(t){
    return rows.reduce(function(a, b){
      return Math.abs(b.t - t) < Math.abs(a.t - t) ? b : a
    })
  }

  // ============ ONE NEUTRAL LABEL: data floor / pop-in ============
  if (!isMobile){
    var medStart = rows.find(function(d){ return measurable('p50', d) })
    if (medStart){
      var msX = c.x(medStart.t), msY = c.y(medStart.p50)
      var anX = c.x(1968), anY = c.y(maxVal / 10 * 9)
      leader(msX, msY, anX + 4, anY + 6)
      c.svg.append('text').text('each decile appears once measurable')
        .at({x: anX, y: anY, textAnchor: 'start', fontSize: 10, fontStyle: 'italic',
          fill: '#9aa6b8', stroke: '#fff', strokeWidth: 2.6}).st({paintOrder: 'stroke'})
      c.svg.append('text').text('above the 1962 data floor')
        .at({x: anX, y: anY + 12, textAnchor: 'start', fontSize: 10, fontStyle: 'italic',
          fill: '#9aa6b8', stroke: '#fff', strokeWidth: 2.6}).st({paintOrder: 'stroke'})
    }
  }

  // ============ HOVER: vertical guide + multi-value tooltip ============
  var ttSel = window.ttSel
  var guide = c.svg.append('line.guide')
    .at({y1: 0, y2: c.height, stroke: '#bbb', strokeWidth: 1, opacity: 0})
  var hoverDots = {}
  pcts.forEach(function(p){
    hoverDots['p' + p] = c.svg.append('circle')
      .at({r: 3, fill: pctMeta['p' + p].color, stroke: '#fff', strokeWidth: 1.2, opacity: 0})
  })

  c.svg.append('rect.hit')
    .at({width: c.width, height: c.height, fill: 'transparent'})
    .on('mousemove', function(){
      var mx = d3.mouse(this)[0]
      var t = c.x.invert(mx)
      var d = rowAt(t)
      var gx = c.x(d.t)
      guide.at({x1: gx, x2: gx, opacity: 1})
      pcts.forEach(function(p){
        if (d.cens <= (100 - p) / 100){
          hoverDots['p' + p].translate([gx, c.y(d['p' + p])]).at({opacity: 1})
        } else {
          hoverDots['p' + p].at({opacity: 0})
        }
      })
      if (ttSel){
        ttSel.classed('tooltip-hidden', 0).html(tooltipHtml(d, pctMeta))
        ttSel.st({
          left: Math.min(d3.event.clientX + 16, window.innerWidth - 200) + 'px',
          top: (d3.event.clientY + 16) + 'px'
        })
      }
    })
    .on('mouseout', function(){
      guide.at({opacity: 0})
      pcts.forEach(function(p){ hoverDots['p' + p].at({opacity: 0}) })
      if (ttSel) ttSel.classed('tooltip-hidden', 1)
    })

  // ============ MINIMAL SUBTITLE (page has the h1) ============
  c.svg.append('text.subtitle').text('Years in the index, by decile')
    .at({x: 0, y: -margin.top + 22, fontSize: 13, fontWeight: 600, fill: '#444'})

  // ---- axes ----
  d3.drawAxis(c)
  c.svg.selectAll('.x, .y').classed('axis', 1)
  c.svg.selectAll('.x text, .y text').at({fontSize: 11, fill: '#8a8a8a'})
  c.svg.selectAll('.domain').at({stroke: '#d8d8d8'})
  c.svg.selectAll('.tick line').at({stroke: '#d8d8d8'})
  c.svg.append('text').text('years in index')
    .at({x: 4, y: c.y(yTicks[yTicks.length - 1]) - 9, textAnchor: 'start', fontSize: 10.5, fill: '#999'})

  // multi-value tooltip html (high deciles first; dash where not yet measurable)
  function tooltipHtml(d, meta){
    var s = '<b>' + d.q + '</b> &middot; ' + d.n + ' members<br>'
    var order = [90, 80, 70, 60, 50, 40, 30, 20, 10]
    order.forEach(function(p){
      var m = meta['p' + p]
      var bold = p == 50
      var lab = bold ? 'median' : p + 'th'
      var meas = d.cens <= (100 - p) / 100
      var val = meas ? d['p' + p].toFixed(1) + ' yrs' : '&mdash;'
      s += '<div class="row"><span style="color:' + m.color + (bold ? ';font-weight:700' : '') + '">' +
        lab + '</span>' +
        '<span' + (bold ? ' style="font-weight:700"' : '') +
        (meas ? '' : ' style="color:#bbb"') + '>' + val + '</span></div>'
    })
    s += '<div class="row cens"><span>joined before 1962</span><span>' +
      Math.round(d.cens * 100) + '%</span></div>'
    return s
  }
}
