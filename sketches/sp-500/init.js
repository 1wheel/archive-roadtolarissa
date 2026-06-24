window.ttSel = d3.select('body').selectAppend('div.sp500-tt.tooltip-hidden')

window.init = function(){
  if (!window.parquetRows) return
  var grouped = util.parse(window.parquetRows)

  drawPercentiles(grouped)
  drawHeatmap(grouped)
  drawMarey(grouped)
  drawCohorts(grouped)
  drawRegl(grouped)
}

if (window.parquetRows) init()
else window.addEventListener('parquet-ready', init)
d3.select(window).on('resize.sp500', () => window.parquetRows && init())
