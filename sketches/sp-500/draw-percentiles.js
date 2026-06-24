// Decile line chart: years a company has been in the S&P 500 at each decile,
// per quarter 1963-2026. Deciles 10th-80th; 50th emphasised. Each decile "pops
// in" only once measurable above the 1962 data floor (cens <= (100-p)/100).
// No tooltip: a dot sits at the end of each line and the value after each label
// updates as you mouse across.
window.drawPercentiles = function(data){
  var rows = data.pctSeries

  var pctMeta = {
    p80: {color: '#8ea7c2', width: 1.3, op: 0.85, label: '80th'},
    p70: {color: '#7d99b7', width: 1.3, op: 0.9,  label: '70th'},
    p60: {color: '#5d7ea6', width: 1.3, op: 0.9,  label: '60th'},
    p50: {color: '#1d3557', width: 3.0, op: 1,    label: '50th'},
    p40: {color: '#5d7ea6', width: 1.3, op: 0.9,  label: '40th'},
    p30: {color: '#7d99b7', width: 1.3, op: 0.9,  label: '30th'},
    p20: {color: '#8ea7c2', width: 1.3, op: 0.85, label: '20th'},
    p10: {color: '#9fb4cc', width: 1.3, op: 0.85, label: '10th'}
  }
  var drawOrder = ['p80', 'p70', 'p60', 'p40', 'p30', 'p20', 'p10', 'p50']  // 50th on top
  var topDown   = ['p80', 'p70', 'p60', 'p50', 'p40', 'p30', 'p20', 'p10']

  var chartSel = d3.select('.c-percentiles .chart').html('')
  if (!chartSel.node()) return

  var measured = chartSel.node().getBoundingClientRect().width || window.innerWidth
  var availWidth = Math.min(measured, document.documentElement.clientWidth - 10)
  var isMobile = availWidth < 640

  var totalWidth = Math.min(availWidth, 940)
  var margin = isMobile
    ? {top: 34, right: 64, bottom: 40, left: 36}
    : {top: 38, right: 150, bottom: 48, left: 50}

  var c = d3.conventions({
    sel: chartSel,
    totalWidth: totalWidth,
    height: (isMobile ? 380 : 440) - margin.top - margin.bottom,
    margin: margin
  })

  // ---- scales ---- (y domain runs to 48 so the 80th decile, which climbs to
  // ~46 yrs in the recent era, is fully drawn rather than clamped into a flat
  // confusing line along the top. clamp() is kept as a harmless safety net.)
  c.x = d3.scaleLinear().domain([1962, 2027]).range([0, c.width])
  c.y = d3.scaleLinear().domain([0, 48]).range([c.height, 0]).clamp(true)

  var yTicks = [0, 10, 20, 30, 40]
  c.xAxis = d3.axisBottom(c.x).ticks(isMobile ? 5 : 8).tickFormat(d3.format('d'))
  c.yAxis = d3.axisLeft(c.y).tickValues(yTicks).tickFormat(function(d){ return d })

  // ggPlot panel (Adam's style): light-grey #EAECED background + white gridlines,
  // lowered so they sit behind the data.
  var gg = c.svg.append('g.gg').lower()
  gg.append('rect').at({width: c.width, height: c.height, fill: '#EAECED'})
  gg.appendMany('line', yTicks).at({x1: 0, x2: c.width, y1: c.y, y2: c.y, stroke: '#fff', strokeWidth: 1})
  gg.appendMany('line', c.x.ticks(isMobile ? 5 : 8)).at({y1: 0, y2: c.height, x1: c.x, x2: c.x, stroke: '#fff', strokeWidth: 1})

  // A decile is measurable once censored (pre-1962) share <= (100-p)/100.
  function measurable(key, d){ return d.cens <= (100 - +key.slice(1)) / 100 }
  function measurableSpan(key){
    for (var i = 0; i < rows.length; i++) if (measurable(key, rows[i])) return rows.slice(i)
    return []
  }

  // ---- decile lines (solid only where measurable) ----
  function lineGen(key){
    return d3.line().x(function(d){ return c.x(d.t) }).y(function(d){ return c.y(d[key]) })
  }
  drawOrder.forEach(function(k){
    var m = pctMeta[k], solid = measurableSpan(k)
    if (solid.length > 1) c.svg.append('path')
      .at({d: lineGen(k)(solid), stroke: m.color, strokeWidth: m.width, fill: 'none',
        opacity: m.op, strokeLinejoin: 'round', strokeLinecap: 'round'})
  })

  // ============ END DOTS + LABELS (value updates on hover) ============
  var last = rows[rows.length - 1]
  var lx = c.x(last.t)
  var annoSel = c.svg.append('g.anno')

  // Align each label to its line's ACTUAL end y (the data y, clamped to chart).
  // No dodging, no leader lines: labels sit at the line ends. A tiny clamp keeps
  // the top/bottom labels from spilling past the plot edges.
  var labels = topDown.map(function(k){
    var y = c.y(last[k])
    return {k: k, m: pctMeta[k], y: Math.max(8, Math.min(c.height - 2, y)) }
  })

  var LABEL_SIZE = 11      // uniform size + weight for EVERY decile label + value
  var LABEL_WEIGHT = 600   // identical for all deciles (50th is not bolder)
  var dotSel = {}          // per-decile end dot, moved on hover
  var valSel = {}          // per-decile value <text>, updated on hover
  labels.forEach(function(l){
    var isMed = l.k == 'p50'
    // dot at the end of the line (at the true data y). slides on mousemove.
    dotSel[l.k] = annoSel.append('circle')
      .at({cx: lx, cy: c.y(last[l.k]), r: isMed ? 3.4 : 2.6, fill: l.m.color, stroke: '#fff', strokeWidth: 1})
    // label, aligned to the line's data y. ALL labels share size + weight;
    // the 50th is only a touch darker (its own color), never bigger or bolder.
    annoSel.append('text').text(l.m.label)
      .at({x: lx + 8, y: l.y + 4, textAnchor: 'start', fontSize: LABEL_SIZE,
        fontWeight: LABEL_WEIGHT, fill: l.m.color, stroke: '#fff', strokeWidth: 2.6})
      .st({paintOrder: 'stroke'})
    // value (updates on mousemove) — uniform weight; 50th only a darker grey
    valSel[l.k] = annoSel.append('text').text(last[l.k].toFixed(1))
      .at({x: lx + 8 + 30, y: l.y + 4, textAnchor: 'start', fontSize: LABEL_SIZE,
        fontWeight: 400, fill: isMed ? '#555' : '#888', stroke: '#fff', strokeWidth: 2.4})
      .st({paintOrder: 'stroke'})
  })
  annoSel.append('text').text('yrs')
    .at({x: lx + 8, y: labels[0].y - 11, textAnchor: 'start', fontSize: 9.5, fill: '#aaa'})

  function rowAt(t){
    return rows.reduce(function(a, b){ return Math.abs(b.t - t) < Math.abs(a.t - t) ? b : a })
  }
  // Update every decile's value text AND slide its end dot to row d's point.
  // A decile only shows a dot/value where it is measurable at that quarter.
  function update(d){
    topDown.forEach(function(k){
      var isMed = k == 'p50', meas = measurable(k, d)
      valSel[k].text(meas ? d[k].toFixed(1) : '—')
        .st({fill: meas ? (isMed ? '#555' : '#888') : '#ccc'})
      dotSel[k]
        .at({cx: c.x(d.t), cy: c.y(d[k])})
        .st({display: meas ? null : 'none'})
    })
  }

  // ============ HOVER: vertical guide + slide dots + update values (no tooltip) ============
  var guide = c.svg.append('line.guide').at({y1: 0, y2: c.height, stroke: '#bbb', strokeWidth: 1, opacity: 0})
  c.svg.append('rect.hit')
    .at({width: c.width, height: c.height, fill: 'transparent'})
    .on('mousemove', function(){
      var d = rowAt(c.x.invert(d3.mouse(this)[0]))
      guide.at({x1: c.x(d.t), x2: c.x(d.t), opacity: 1})
      update(d)   // dots move to the hovered quarter; values follow
    })
    .on('mouseout', function(){ guide.at({opacity: 0}); update(last) })  // dots snap back to the latest point

  // ============ MINIMAL SUBTITLE ============
  c.svg.append('text.subtitle').text('Years in the index, by decile')
    .at({x: 0, y: -margin.top + 22, fontSize: 13, fontWeight: 600, fill: '#444'})

  // ---- axes ---- (ggPlot: no domain, no tick marks; white gridlines do the work)
  d3.drawAxis(c)
  c.svg.selectAll('.x, .y').classed('axis', 1)
  c.svg.selectAll('.domain').remove()
  c.svg.selectAll('.tick line').st({display: 'none'})
  c.svg.selectAll('.x text').at({y: 9, fontSize: 11, fill: '#8a8a8a'})
  c.svg.selectAll('.y text').at({x: -6, fontSize: 11, fill: '#8a8a8a'})
}
