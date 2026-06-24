// parse the flat parquet rows ONCE into the structures each chart needs.
// rows: {q, t, ticker, entry_year, tenure} per (quarter, member).
window.util = {
  parse(rows){
    var byQ = d3.nestBy(rows, d => d.q)
    byQ.forEach(c => {
      c.q = c.key; c.t = c[0].t
      c.sort((a,b) => a.tenure - b.tenure)   // tenure ascending (newest bottom)
    })
    byQ.sort((a,b) => a.t - b.t)

    // per-quarter percentile + censored share
    var P = [10,20,30,40,50,60,70,80,90]
    function pct(a, p){ var i=(a.length-1)*p/100, lo=~~i; return a[lo] + (a[Math.min(lo+1,a.length-1)]-a[lo])*(i-lo) }
    var pctSeries = byQ.map(c => {
      var ten = c.map(d => d.tenure).sort((a,b)=>a-b)
      var o = {t: c.t, q: c.q, n: c.length, cens: d3.mean(c, d => (d.entry_year==null || d.entry_year<=1962.5) ? 1 : 0)}
      P.forEach(p => o['p'+p] = pct(ten, p))
      return o
    })

    // per-company spans (marey): group by ticker+entry_year
    var spans = d3.nestBy(rows.filter(d => d.ticker), d => d.ticker + '|' + d.entry_year)
      .map(g => {
        var ts = g.map(d => d.t)
        return {ticker: g[0].ticker, entry: g[0].entry_year, enter_t: d3.min(ts), exit_t: d3.max(ts)+0.25,
                og: g[0].entry_year==null || g[0].entry_year<=1962.5, tenure: d3.max(g,d=>d.tenure)}
      })

    return {rows, columns: byQ, pctSeries, spans, pcts: P, floor: 1962.5}
  }
}
