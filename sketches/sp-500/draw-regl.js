// regl/WebGL "every membership span" chart, drawn as one BOX PER COMPANY-QUARTER.
// ~126,000 cells (quarters x members). Each cell is a quad whose x spans its
// quarter's column on a 1962-2026.5 time scale. Three buttons morph the vertical
// layout; the vertex shader interpolates each cell between two precomputed y
// targets over ~700ms:
//   stacked : y = the cell's RANK within its quarter (the heatmap; grey OG on top)
//   entry   : y = the COMPANY's row in entry-sorted order  -> cells of one company
//             collapse onto a single horizontal line (the marey, by entry)
//   exit    : y = the company's row in exit-sorted order
// A SECOND button row recolours every cell (re-uploading aColor):
//   tenure    : turbo on the cell's running tenure (0..45yr)   [default]
//   start date: turbo on the company's entry year (1962..2026)
//   end date  : turbo on the company's exit year
//   max tenure: turbo on the company's total span (0..~64yr)
//   tenure @  : a draggable vertical date line; colour = each company's tenure AT
//               that date (date-entry while in the index; grey if not in then)
// Grey #e4e4e4 for OG. White background. Retina-crisp via devicePixelRatio.
window.drawRegl = function(data){
  var sel = d3.select('.c-regl .chart').html('')
  if (!sel.node()) return
  if (!window.createREGL){ sel.append('div').st({color:'#c00',font:'13px sans-serif'}).text('regl failed to load'); return }

  var floor = data.floor  // 1962.5

  // ---- layout (CSS pixels) ----
  var totalWidth = Math.min(window.innerWidth - 32, 960)
  var margin = {top: 8, right: 18, bottom: 26, left: 16}
  var cvW = totalWidth, cvH = 620
  var W = cvW - margin.left - margin.right
  var H = cvH - margin.top - margin.bottom
  var dpr = window.devicePixelRatio || 1

  // ---- inline turbo colormap -> [r,g,b] in 0..1 ----
  function turbo(t){
    t = t < 0 ? 0 : t > 1 ? 1 : t
    var r = 0.13572138 + t*(4.61539260 + t*(-42.66032258 + t*(132.13108234 + t*(-152.94239396 + t*59.28637943))))
    var g = 0.09140261 + t*(2.19418839 + t*(4.84296658 + t*(-14.18503333 + t*(4.27729857 + t*2.82956604))))
    var b = 0.10667330 + t*(12.64194608 + t*(-60.58204836 + t*(110.36276771 + t*(-89.90310912 + t*27.34824973))))
    function cc(x){ return x < 0 ? 0 : x > 1 ? 1 : x }
    return [cc(r), cc(g), cc(b)]
  }
  var TEN_MAX = 45
  var GREY_OG = [0.894, 0.894, 0.894] // #e4e4e4
  var GREY_DIM = [0.93, 0.93, 0.93]   // "not in the index then" for tenure@date
  // colour ranges for the date-based ramps
  var YEAR_MIN = 1962, YEAR_MAX = 2026.5
  var MAXTEN_MAX = 64

  // ---- x scale (decimal year) + per-quarter column edges ----
  var columns = data.columns
  var nQ = columns.length
  var x = d3.scaleLinear().domain([1962, 2026.5]).range([0, W])
  var years = columns.map(function(c){ return c.t })
  // edge[i] = left boundary of quarter i (midpoints between adjacent quarters)
  var edges = new Array(nQ + 1)
  edges[0] = x(years[0]) - (x(years[1]) - x(years[0])) / 2
  for (var i = 1; i < nQ; i++) edges[i] = (x(years[i-1]) + x(years[i])) / 2
  edges[nQ] = x(years[nQ-1]) + (x(years[nQ-1]) - x(years[nQ-2])) / 2

  // ---- company rows for entry / exit layouts ----
  // span key matches util.js: id + '|' + entry_year. id is the UNIQUE canonical
  // company key — tickers are reused over time (old vs modern ADM/TXT/BRK), so we
  // NEVER group / trace / hit-test by ticker.
  var spans = data.spans
  var STILL_IN = 2026.3   // exit_year >= this -> firm is still in the index
  var keyOf = function(id, entry){ return id + '|' + entry }
  var entrySorted = spans.slice().sort(function(a, b){
    var ea = a.og ? -1 : a.entry, eb = b.og ? -1 : b.entry
    return ea - eb || a.exit_t - b.exit_t
  })
  var exitSorted = spans.slice().sort(function(a, b){
    return a.exit_t - b.exit_t || (a.og ? -1 : a.entry) - (b.og ? -1 : b.entry)
  })
  var nCo = spans.length
  var rowEntry = {}, rowExit = {}
  entrySorted.forEach(function(s, r){ rowEntry[keyOf(s.id, s.entry)] = r })
  exitSorted.forEach(function(s, r){ rowExit[keyOf(s.id, s.entry)] = r })
  // span lookup by key (id, name, ticker, entry/exit, og flag, max tenure) for
  // recolour + tooltips
  var spanByKey = {}
  spans.forEach(function(s){ spanByKey[keyOf(s.id, s.entry)] = s })

  // ---- per-column stacked rank (heatmap order: grey OG on top) ----
  // rebuild member objects with isPre / tenure, sort each column, capture rank.
  // tenure ties break by exit_year (stable, matching util.js) so neighbours stay
  // put quarter-to-quarter instead of churning.
  var maxN = 0
  var colMembers = columns.map(function(col){
    var t = col.t
    var m = col.map(function(row){
      var ey = row.entry_year
      if (ey === undefined || (typeof ey == 'number' && isNaN(ey))) ey = null
      var isPre = ey === null || ey <= floor
      return {
        id: row.id,                   // UNIQUE company key (never use ticker to group)
        ticker: row.ticker == null ? '' : row.ticker,
        name: row.name == null ? '' : row.name,
        entry: row.entry_year,        // raw, for span-key match
        ey: ey,
        exitYear: row.exit_year,      // decimal year the span ends
        isPre: isPre,
        tenure: Math.max(0, isPre ? (t - floor) : (t - ey))
      }
    })
    m.sort(function(a, b){
      if (a.isPre !== b.isPre) return a.isPre ? 1 : -1  // grey OG to the top
      return (a.tenure - b.tenure) || (a.exitYear - b.exitYear)  // young bottom -> old top, ties by exit
    })
    if (m.length > maxN) maxN = m.length
    return m
  })

  // ---- normalised y helpers -> device pixels (top..bottom in plot area) ----
  // each layout normalised to [0,1] then mapped into the plot, scaled by dpr.
  var topPx = margin.top * dpr, plotH = H * dpr
  // stacked: rank 0 at bottom (newest) .. maxN-1 near top, matching the heatmap
  function yStacked(rank, n){
    // place each member 1 row tall; bottom = newest. normalise by maxN so columns
    // of different heights share the same scale, then flip (rank 0 -> bottom).
    var f = 1 - (rank + 0.5) / maxN
    return topPx + f * plotH
  }
  function yCompany(rowIdx){
    var f = (rowIdx + 0.5) / nCo
    return topPx + f * plotH
  }

  // ---- build per-vertex buffers (quad = 2 triangles = 6 verts) ----
  // corner flags: cx in {0,1} -> left/right column edge, cy in {0,1} -> top/bottom
  var corners = [[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]]

  // total cell count
  var nCells = 0
  for (var ci = 0; ci < nQ; ci++) nCells += colMembers[ci].length
  var V = nCells * 6

  var aX0 = new Float32Array(V)
  var aX1 = new Float32Array(V)
  var aYstack = new Float32Array(V)
  var aYentry = new Float32Array(V)
  var aYexit  = new Float32Array(V)
  var aCornerY = new Float32Array(V)
  var aColor = new Float32Array(V * 3)

  // per-CELL metadata (one entry per cell, in vertex order) so we can recolour and
  // hit-test without touching the geometry: company key, entry/exit years, etc.
  var cellTen = new Float32Array(nCells)   // running tenure of the cell's quarter
  var cellEntry = new Float32Array(nCells) // company entry year (NaN -> OG)
  var cellExit = new Float32Array(nCells)  // company exit year (decimal, for colour ramp)
  var cellMaxTen = new Float32Array(nCells)// company total span
  var cellPre = new Uint8Array(nCells)     // 1 if pre-1962 OG (grey)

  // cell height (device px). stacked rows are plotH/maxN tall; clamp to >=1 dev px
  // so nothing vanishes, but keep the heatmap feel (give entry/exit a hairline).
  var stackRowDev = Math.max(1, plotH / maxN)
  var coRowDev = Math.max(1, plotH / nCo)

  var vi = 0, cellIdx = 0
  for (ci = 0; ci < nQ; ci++){
    var members = colMembers[ci]
    var nx0 = (margin.left * dpr) + edges[ci] * dpr
    var nx1 = (margin.left * dpr) + edges[ci + 1] * dpr
    if (nx1 - nx0 < 1) nx1 = nx0 + 1   // >=1 device px wide
    for (var r = 0; r < members.length; r++){
      var d = members[r]
      var col = d.isPre ? GREY_OG : turbo(d.tenure / TEN_MAX)
      var key = keyOf(d.id, d.entry)   // UNIQUE id, not ticker (tickers are reused)
      var span = spanByKey[key]
      var reY = (key in rowEntry) ? rowEntry[key] : 0
      var rxY = (key in rowExit)  ? rowExit[key]  : 0
      var ysTop = yStacked(r, members.length)
      var yeTop = yCompany(reY)
      var yxTop = yCompany(rxY)
      // record cell metadata (used by recolour + tooltip)
      cellTen[cellIdx]    = d.tenure
      cellEntry[cellIdx]  = d.isPre ? NaN : d.ey
      cellExit[cellIdx]   = d.exitYear   // decimal exit year (for the end-date ramp)
      cellMaxTen[cellIdx] = span ? span.tenure : 0
      cellPre[cellIdx]    = d.isPre ? 1 : 0
      for (var k = 0; k < 6; k++){
        aX0[vi] = nx0
        aX1[vi] = nx1
        // top-of-cell y for each layout; cornerY adds the row height below
        aYstack[vi] = ysTop
        aYentry[vi] = yeTop
        aYexit[vi]  = yxTop
        aCornerY[vi] = corners[k][1]
        aColor[vi*3 + 0] = col[0]
        aColor[vi*3 + 1] = col[1]
        aColor[vi*3 + 2] = col[2]
        vi++
      }
      cellIdx++
    }
  }
  // cornerX attribute (left/right edge selector), per vertex
  var aCornerX = new Float32Array(V)
  for (var c2 = 0; c2 < nCells; c2++){
    for (var kk = 0; kk < 6; kk++) aCornerX[c2*6 + kk] = corners[kk][0]
  }

  // ================= header / subtitle / buttons =================
  var head = sel.append('div.rg-head')
  head.append('span.rg-sub').text('Every membership span')
  var toggle = head.append('span.rg-toggle')
  var modes = [['stacked','stacked'],['entry','entry'],['exit','exit']]
  var current = window.__reglMode || 'stacked'
  if (!modes.some(function(m){ return m[0] === current })) current = 'stacked'
  var btns = toggle.appendMany('button', modes)
    .classed('on', function(d){ return d[0] === current })
    .text(function(d){ return d[1] })
    .on('click', function(d){ setMode(d[0]) })

  // ---- second button row: colour-by toggle ----
  var head2 = sel.append('div.rg-head').st({marginTop: '-2px'})
  head2.append('span.rg-sub').text('colour by').st({fontSize: '12px', color: '#aaa'})
  var ctoggle = head2.append('span.rg-toggle')
  var colorModes = [['tenure','tenure'],['start','start date'],['end','end date'],['max','max tenure'],['atdate','tenure @ date']]
  var colorMode = window.__reglColor || 'tenure'
  if (!colorModes.some(function(m){ return m[0] === colorMode })) colorMode = 'tenure'
  var cbtns = ctoggle.appendMany('button', colorModes)
    .classed('on', function(d){ return d[0] === colorMode })
    .text(function(d){ return d[1] })
    .on('click', function(d){ setColorMode(d[0]) })

  // ---- canvas + regl (retina: drawing buffer = css * dpr, styled to css) ----
  var plotSel = sel.append('div.rg-plot')
  var canvasSel = plotSel.append('canvas')
    .at({width: Math.round(cvW * dpr), height: Math.round(cvH * dpr)})
    .st({width: cvW + 'px', height: cvH + 'px'})
  var canvas = canvasSel.node()

  // axis overlay (svg, css coords) — decade ticks along the bottom + date line
  var svg = plotSel.append('svg').at({width: cvW, height: cvH})
  var xTickYears = []; for (var yy = 1970; yy <= 2020; yy += 10) xTickYears.push(yy)
  var axisG = svg.append('g.rg-axis').translate([0, margin.top + H + 2])
  axisG.appendMany('g.rg-x-tick', xTickYears)
    .translate(function(d){ return [margin.left + x(d), 0] })
    .each(function(d){
      var g = d3.select(this)
      g.append('line').at({y1: 0, y2: 6, stroke: '#bbb'})
      g.append('text.rg-x-label').text(d).at({y: 18, textAnchor: 'middle'})
    })

  // draggable vertical date line for "tenure @ date" (hidden unless that mode is on)
  var atDate = window.__reglAtDate || 2008  // remembered handle position
  var dateG = svg.append('g.rg-dateline').st({display: 'none'})
  dateG.append('line').at({y1: margin.top, y2: margin.top + H})
    .st({stroke: '#1d3557', strokeWidth: 1.5, strokeDasharray: '3 3'})
  var dateLbl = dateG.append('text.rg-date-label')
    .at({y: margin.top - 1, textAnchor: 'middle'})
    .st({fontSize: '11px', fill: '#1d3557', fontWeight: 600,
         paintOrder: 'stroke', stroke: '#fff', strokeWidth: '3px', strokeLinejoin: 'round'})

  var regl
  try {
    // pixelRatio 1: we size the canvas ourselves and feed device-pixel coords.
    regl = window.createREGL({canvas: canvas, pixelRatio: 1, attributes: {antialias: true, alpha: false, preserveDrawingBuffer: true}})
  } catch(e){
    plotSel.append('div').st({color:'#c00',font:'13px sans-serif',padding:'8px'}).text('WebGL unavailable: ' + e.message)
    return
  }
  // some environments (headless / no GPU) hand back null instead of throwing
  if (!regl){
    plotSel.append('div').st({color:'#c00',font:'13px sans-serif',padding:'8px'}).text('WebGL unavailable')
    return
  }

  var viewW = Math.round(cvW * dpr), viewH = Math.round(cvH * dpr)

  var colorBuf = regl.buffer(aColor)
  var drawCells = regl({
    vert: [
      'precision highp float;',
      // layout select happens on the CPU via which two buffers we feed; the
      // shader just mixes a "from" and "to" top-y, each with its own row height.
      'attribute float aX0, aX1, aCornerX, aCornerY;',
      'attribute float aYfrom, aYto, aRowFrom, aRowTo;',
      'attribute vec3 aColor;',
      'uniform float uMixA, uViewW, uViewH;',
      'varying vec3 vColor;',
      'void main(){',
      '  float xpix = mix(aX0, aX1, aCornerX);',
      '  float rowH = mix(aRowFrom, aRowTo, uMixA);',
      '  float yTop = mix(aYfrom, aYto, uMixA);',
      '  float ypix = yTop + aCornerY * rowH;',
      '  float cx = xpix / uViewW * 2.0 - 1.0;',
      '  float cy = 1.0 - ypix / uViewH * 2.0;',
      '  vColor = aColor;',
      '  gl_Position = vec4(cx, cy, 0.0, 1.0);',
      '}'
    ].join('\n'),
    frag: [
      'precision highp float;',
      'varying vec3 vColor;',
      'void main(){ gl_FragColor = vec4(vColor, 1.0); }'
    ].join('\n'),
    attributes: {
      aX0: regl.buffer(aX0),
      aX1: regl.buffer(aX1),
      aCornerX: regl.buffer(aCornerX),
      aCornerY: regl.buffer(aCornerY),
      aColor: {buffer: colorBuf, size: 3},
      aYfrom: function(ctx, props){ return props.yfrom },
      aYto:   function(ctx, props){ return props.yto },
      aRowFrom: function(ctx, props){ return props.rowFrom },
      aRowTo:   function(ctx, props){ return props.rowTo }
    },
    uniforms: {
      uMixA: regl.prop('mix'),
      uViewW: viewW, uViewH: viewH
    },
    count: V,
    primitive: 'triangles',
    depth: {enable: false}
  })

  // y-top buffers + matching row-height buffers (uniform per cell, so a 1-float
  // attribute won't do; we make full-length constant arrays once).
  var bufStack = regl.buffer(aYstack)
  var bufEntry = regl.buffer(aYentry)
  var bufExit  = regl.buffer(aYexit)
  function rowConst(val){ var a = new Float32Array(V); for (var i = 0; i < V; i++) a[i] = val; return regl.buffer(a) }
  var rowStackBuf = rowConst(stackRowDev)
  var rowCoBuf    = rowConst(coRowDev)
  function bufFor(mode){ return mode === 'entry' ? bufEntry : mode === 'exit' ? bufExit : bufStack }
  function rowFor(mode){ return mode === 'stacked' ? rowStackBuf : rowCoBuf }

  function render(fromMode, toMode, mix){
    regl.clear({color: [1, 1, 1, 1], depth: 1})
    drawCells({
      yfrom: bufFor(fromMode), yto: bufFor(toMode),
      rowFrom: rowFor(fromMode), rowTo: rowFor(toMode),
      mix: mix
    })
  }

  // ================= COLOUR-BY: recompute aColor + re-upload =================
  // colourForCell(i) -> [r,g,b]; recolour() writes every cell's 6 verts and
  // uploads the buffer. atColour uses the current `atDate` handle position.
  function colourForCell(i){
    if (cellPre[i]) return GREY_OG
    if (colorMode === 'tenure') return turbo(cellTen[i] / TEN_MAX)
    if (colorMode === 'start')  return turbo((cellEntry[i] - YEAR_MIN) / (YEAR_MAX - YEAR_MIN))
    if (colorMode === 'end')    return turbo((cellExit[i] - YEAR_MIN) / (YEAR_MAX - YEAR_MIN))
    if (colorMode === 'max')    return turbo(cellMaxTen[i] / MAXTEN_MAX)
    // 'atdate': tenure of this company AT atDate (grey if not in the index then)
    var entry = cellEntry[i], exit = cellExit[i]
    if (isNaN(entry) || atDate < entry || atDate > exit) return GREY_DIM
    return turbo((atDate - entry) / TEN_MAX)
  }
  function recolour(){
    for (var i = 0; i < nCells; i++){
      var col = colourForCell(i)
      var base = i * 18  // 6 verts * 3 channels
      for (var k = 0; k < 6; k++){
        aColor[base + k*3 + 0] = col[0]
        aColor[base + k*3 + 1] = col[1]
        aColor[base + k*3 + 2] = col[2]
      }
    }
    colorBuf(aColor)
  }

  // ---- animated transition between layouts ----
  var DUR = 700
  function easeInOut(t){ return t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t }
  var rafId = null
  function setMode(mode){
    if (mode === current && canvasDrawn) return
    var fromMode = current
    current = mode
    window.__reglMode = mode
    btns.classed('on', function(d){ return d[0] === mode })
    if (rafId) cancelAnimationFrame(rafId)
    var t0 = performance.now()
    function frame(now){
      var p = Math.min(1, (now - t0) / DUR)
      render(fromMode, mode, easeInOut(p))
      if (p < 1) rafId = requestAnimationFrame(frame)
      else rafId = null
    }
    rafId = requestAnimationFrame(frame)
  }

  function setColorMode(mode){
    colorMode = mode
    window.__reglColor = mode
    cbtns.classed('on', function(d){ return d[0] === mode })
    var on = mode === 'atdate'
    dateG.st({display: on ? 'inline' : 'none'})
    canvasSel.st({cursor: on ? 'ew-resize' : 'default'})
    if (on) positionDateLine()
    recolour()
    render(current, current, 1)
  }

  // ---- date-line handle (drag anywhere on the canvas to recolour live) ----
  // We drive it off the canvas's own mouse events (the svg overlay is
  // pointer-events:none), so dragging never steals the hover tooltip's events.
  function positionDateLine(){
    var px = margin.left + x(atDate)
    dateG.select('line').at({x1: px, x2: px})
    dateLbl.at({x: px}).text(Math.round(atDate))
  }
  function dateFromPx(mx){
    return Math.max(1963, Math.min(2026, x.invert(mx - margin.left)))
  }
  var dragging = false
  function onDrag(mx){
    atDate = dateFromPx(mx); window.__reglAtDate = atDate
    positionDateLine(); recolour(); render(current, current, 1)
  }
  canvasSel.on('mousedown.rgdate', function(){
    if (colorMode !== 'atdate') return
    dragging = true; onDrag(d3.mouse(this)[0]); d3.event.preventDefault()
  })
  d3.select(window)
    .on('mousemove.rgdate', function(){
      if (!dragging) return
      onDrag(d3.mouse(canvasSel.node())[0])
    })
    .on('mouseup.rgdate', function(){ dragging = false })

  // ================= HOVER TOOLTIP =================
  // hit-test the cell under the cursor for the CURRENT layout, then show the
  // company's ticker / entry / exit / tenure from the cell metadata we built.
  var ttSel = window.ttSel
  function findColumn(plotX){
    // edges[] are plot-relative CSS px; binary search for the column containing x
    if (plotX < edges[0]) return 0
    if (plotX >= edges[nQ]) return nQ - 1
    var lo = 0, hi = nQ - 1
    while (lo < hi){ var mid = (lo + hi + 1) >> 1; if (edges[mid] <= plotX) lo = mid; else hi = mid - 1 }
    return lo
  }
  function spanFor(member){ return spanByKey[keyOf(member.id, member.entry)] }
  function esc(s){ return String(s).replace(/[&<>]/g, function(c){ return c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;' }) }
  function hideTip(){ ttSel.classed('tooltip-hidden', true) }
  function showTip(member, colYear){
    if (!member) return false
    var span = spanFor(member)
    // name (full company name); fall back to ticker, then a generic OG note
    var name = member.name || span && span.name || member.ticker || (member.isPre ? 'OG (pre-1962)' : '')
    if (!name) return false
    var entryTxt = member.isPre ? 'before 1962' : Math.floor(member.ey)
    // exit year: prefer the decimal exit_year off the member/span; still-in if recent
    var exitYr = member.exitYear != null ? member.exitYear : (span ? span.exit_t : null)
    var stillIn = exitYr != null && exitYr >= STILL_IN
    var exitTxt = stillIn ? 'still in' : (exitYr != null ? Math.floor(exitYr) : '—')
    var maxTen = span ? span.tenure : member.tenure
    var tenAtCol = Math.max(0, member.isPre ? (colYear - floor) : (colYear - member.ey))
    // tt-tick is the bold primary line (the company name); ticker on a dim row
    var html = '<div class="tt-tick">' + esc(name) + '</div>'
    if (member.ticker) html += '<div class="tt-row">' + esc(member.ticker) + '</div>'
    html +=
      '<div class="tt-row">joined <b>' + entryTxt + '</b></div>' +
      '<div class="tt-row">' + (stillIn ? '<b>still in</b>' : 'left <b>' + exitTxt + '</b>') + '</div>' +
      '<div class="tt-row">tenure <b>' + maxTen.toFixed(1) + ' yr</b></div>'
    ttSel.classed('tooltip-hidden', false).html(html)
    return true
  }
  function placeTip(){
    var tw = 178, off = 14, lft = d3.event.pageX + off
    if (lft + tw > window.innerWidth) lft = d3.event.pageX - off - tw
    ttSel.st({left: lft + 'px', top: (d3.event.pageY + off) + 'px'})
  }

  canvasSel.on('mousemove.rgtip', function(){
    var pt = d3.mouse(this)
    var mx = pt[0], my = pt[1]
    if (mx < 0 || mx > cvW || my < margin.top || my > margin.top + H) return hideTip()
    var plotX = mx - margin.left
    var ci = findColumn(plotX)
    var colYear = years[ci]
    var member = null

    if (current === 'stacked'){
      // invert yStacked: rank = maxN*(1 - (yCss-top)/H) - 0.5
      var rank = Math.round(maxN * (1 - (my - margin.top) / H) - 0.5)
      var members = colMembers[ci]
      if (rank < 0 || rank >= members.length) return hideTip()
      member = members[rank]
    } else {
      // entry/exit: the row IS a company. invert yCompany.
      var rowIdx = Math.round(nCo * (my - margin.top) / H - 0.5)
      if (rowIdx < 0 || rowIdx >= nCo) return hideTip()
      var span = (current === 'entry' ? entrySorted : exitSorted)[rowIdx]
      // present the company only if the cursor's quarter is within its span
      if (colYear < span.enter_t - 0.13 || colYear > span.exit_t + 0.13) return hideTip()
      // synthesize a member-like object from the span at this quarter (key by id)
      member = {id: span.id, ticker: span.ticker, name: span.name, entry: span.entry,
                ey: span.og ? null : span.entry, exitYear: null, isPre: span.og}
    }
    if (!showTip(member, colYear)) return hideTip()
    placeTip()
  }).on('mouseout.rgtip', hideTip)

  // ---- initial paint ----
  var canvasDrawn = false
  if (colorMode !== 'tenure') recolour()   // rebuild colours if a non-default mode persisted
  if (colorMode === 'atdate'){
    dateG.st({display: 'inline'}); canvasSel.st({cursor: 'ew-resize'}); positionDateLine()
  }
  render(current, current, 1)   // initial paint at rest
  canvasDrawn = true
}
