Preprocessing for [Election Forecast Correlations](https://roadtolarissa.com/forecast-correlation/).

`parse.js` converts the scenarios to an `ArrayBuffer` to load clientside and calculates the pairwise correlation between each state. 


To update the data:

- Save [electoral_college_simulations.csv](https://projects.economist.com/us-2020-forecast/president) as `raw-eco.csv`
- Save [simmed-maps.json](https://projects.fivethirtyeight.com/trump-biden-election-map/simmed-maps.json) as `raw-538.csv`
