var drafts = [];
var players = [];

var colorScale = d3.scale.linear().range(['#d62728', '#fff70f', '#cccccc', '#cccccc', '#e8e8e8', '#e8e8e8']);

//nets>
var eastTeams = ['ATL', 'BOS', 'CHI', 'CHA', 'CLE', 'DET', 'IND', 'MIA', 'MIL', 'NJN', 'NYK', 'ORL', 'PHI', 'TOR', 'WAS'];
var westTeams = ['DAL', 'DEN', 'GSW', 'HOU', 'LAC', 'LAL', 'MEM', 'MIN', 'NOH', 'OKC', 'PHO', 'POR', 'SAC', 'SAS', 'UTA'];

var pastToPresentTeam = {
	BAL: 'WAS',
	BUF: 'LAC',
	CAP: 'WAS',
	CHH: 'NOH',
	CIN: 'SAC',
	KCK: 'SAC',
	KCO: 'SAC',
	NOK: 'NOH',
	NOJ: 'UTA',
	SDC: 'LAC',
	SDR: 'HOU',
	SEA: 'OKC',	
	SFW: 'GSW',
	VAN: 'MEM', //TOR missing some?
	WSB: 'WAS', //boop
}

var teamStats = {};
(eastTeams + ',' + westTeams).split(",").forEach(function(d){
	teamStats[d] = {totalPicks: 0, topPicks: 0};
});

confDivs = d3.selectAll(".confDiv")
				.data([eastTeams, westTeams])

var teamDivClicked = false;
var teamDivs = confDivs.selectAll("div")
				.data(function(d){ return d; }).enter()
			.append("div")
				.attr("class", "teamDiv")
			.on("mouseover", function(d){
				if (!teamDivClicked){
					currentTeam = d;
					playerSVGS.attr("stroke", playerStroke);
				}
			})
			.on("mouseout", function(d){
				if (!teamDivClicked){
					if (currentTeam == d){
						currentTeam = "";
						playerSVGS.attr("stroke", "");
					}
				}
			})
			.on("click", function(d){
				teamDivClicked = (currentTeam != d) || !teamDivClicked;
				teamDivs.attr("class", "teamDiv");
				if (teamDivClicked){
					console.log(teamDivClicked);
					console.log(d);
					currentTeam = d;
					aa =d3.select(this).attr("class", "teamDiv teamDivClicked");
				}
				else{
					currentTeam = "";
				}
				playerSVGS.attr("stroke", playerStroke);
			});
var topPicksDivs;

d3.json('drafts.json', function(data){
	drafts = data;
	drafts.forEach(function(draft){
		draft.players.forEach(function(player){
			player.tteam = typeof pastToPresentTeam[player.team] == "undefined" ? player.team : pastToPresentTeam[player.team];
			teamStats[player.tteam].totalPicks++;

			player.impact = 0;
			if (player.stats){				
				if (player.stats.length == 1){
					var s = player.stats[0];
					player.stats.push({mp:0, per:0, year:(s.year-1)})
					player.stats.push({mp:0, per:0, year:(s.year+1)});
				}
				player.stats.forEach(function(stat){
					stat.year = "" + stat.year;
					player.impact = stat.mp*stat.per + player.impact;
				});
				player.played = true;
			}
			else {
				player.stats = [{mp: 0, per:0, year: "" + draft.year}];
				player.played = false;
			}
			player.year = draft.year;
			player.rank = 12;
		});
		
		draft.players.sort(function(a, b){return b.impact - a.impact;});

		draft.players.forEach(function(player, i){ player.rank = player.played ? i + 1 : 81; });
		draft.players.sort(function(a, b){return a.num - b.num;})

	});


	teamDivs.append('div')
			.attr("class", "teamAbv")
			.text(function(d){ return d; });
	topPicksDivs = topPicks = teamDivs.append('div')
			.attr("class", "topPicks")
			.text(function(d){ return "1"; });
	teamDivs.append("div")
			.attr("class", "totalPicks")
			.text(function(d){ return "/" + teamStats[d].totalPicks; });


	draftDivs = d3.select("#display").selectAll("div")
					.data(drafts).enter()
				.append("div")
					.style("width", "500px")
					.style("height", "38px")
					.style("float", "left")
					.html(function(d){ 
						var yearStr = d.year + "";
						return "<span class='draftYearSpan'>'" + yearStr[2] + yearStr[3] + "</span"; });
	

	playerSVGS = draftDivs.append("svg")
					.attr("height", 25)
					.attr("width", 440)
					.attr("class", "draftSVG")
				.selectAll("rect")
					.data(function(d){return d.players;})
			.enter()
			.append("svg:a")
			    	.attr("xlink:href", function(d) { 
			    		return "http://www.basketball-reference.com" + d.url; })
			    	.attr("xlink:show", "new")
			.append("rect")
				.attr("height", 23)
				.attr("width", 4.5)
				.attr("x", function(d, i){return i *6.89;})
				.attr("y", 1)
				.attr("fill", function(d){ return d.played ? "grey" : "lightgrey"; })
				.on("mouseover", function(d){
					updateTooltip(d);

					d3.select(this)
						.attr("stroke", "black")

					var leftPos = d.year % 2 == 0 ? d3.event.pageX - 5 : d3.event.pageX - 315;
					var topPos =  d.year < 1990   ? d3.event.pageY - 5 : d3.event.pageY - 350;
					tooltip
					    .style("left", leftPos + "px")
					    .style("top",  topPos  + "px")
					    .transition().duration(300)
					    .style("opacity", 1)
					    .style("display", "block")
				})
				.on("mouseout", function(d){
					d3.select(this)
						.attr("stroke", playerStroke)

					tooltip.transition().duration(700).style("opacity", 0);
				});

	updateColorScale(10);
});

var topPicksFormat = d3.format("2d");

function updateColorScale(maxRank){
	d3.select("#rankNum").text(maxRank);	
	colorScale.domain([1, maxRank, maxRank + 1, 80, 81, 21]);
	//teamStats.forEach(function(team){ d.topPicks = 0; });
	
	for (team in teamStats){ teamStats[team].topPicks = 0; }
	playerSVGS.attr("fill", function(d){ 
		//update team's top picks
		if (d.rank <= maxRank){
			teamStats[d.tteam].topPicks++;
		}
		return colorScale(d.rank); });

	topPicksDivs.text(function(d){ return teamStats[d].topPicks; });
}
d3.select("#slide").on("change", function(){ updateColorScale(+this.value); });

var currentTeam = '';

function playerStroke(d){
	return (d.tteam == currentTeam) ? 'Black' : '';
}

function updateTooltip(player){
	var data = player.stats;	

	//remove last charts
	svg.selectAll(".axis").remove();
	svg.selectAll("path").remove();
	svg.selectAll("rect").remove();

	d3.select("#pName").html(player.name.replace(" ", "</br>"));
	d3.select("#pNum").text(suffix(player.num));
	d3.select("#pTeam").text(player.team);
	d3.select("#pRank").text(suffix(player.rank));
	d3.select("#pYear").text(player.year);

	var imgURL = player.url ? player.url.split("/")[3].replace("html", "jpg") 
							: player.name.replace(" ", "_") + ".jpg";
	document.getElementById("tooltipImg").src = "thumbnails/" + imgURL;

	if (data){

		x.domain(d3.extent(data, function(d) { return timeFormat.parse(d.year); }));
		if (data.length == 2){
			x.domain([x.domain()[0], x.domain()[1].setFullYear(x.domain()[1].getFullYear()+1)]);
		}
		if (data.length == 1){
			x.domain([x.domain()[0].setFullYear(x.domain()[0].getFullYear()-1), 
				      x.domain()[1].setFullYear(x.domain()[1].getFullYear()+1)]);
		}

		yMIN.domain([0, 3000]);
		yPER.domain([0, 30]);

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (height) + ")")
			.call(xAxis);

		svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(0,0)")
			.attr("fill", "steelblue")
			.call(yMINAxis);

		svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + (width + 10) + ",0)")
			.attr("fill", "#9467bd")
			.call(yPERAxis);

		svg.selectAll("rect")
				.data(data).enter().append("rect")
			.attr("width", 5)
			.attr("x", function(d){ return x(timeFormat.parse(d.year)); })
			.attr("y", function(d){ return yMIN(d.mp); })
			.attr("height", function(d){ return height - yMIN(d.mp); })
			.attr("fill", "steelblue");

		svg.selectAll("orangerect")
				.data(data).enter().append("rect")
			.attr("width", 5)
			.attr("x", function(d){ return x(timeFormat.parse(d.year)) + 5.5; })
			.attr("y", function(d){ return yPER(Math.abs(d.per)); })
			.attr("height", function(d){ return height - yPER(Math.abs(d.per)); })
			.attr("fill", function(d){ return d.per > 0 ? '#9467bd' : 'black'; });

		console.log(player);
	}
}

function suffix(n) {
	mod = n % 10;
	return n + (mod > 3 ? 'th' : ['th', 'st', 'nd', 'rd'][mod]);
};
