var histogramChart,
	unitPieChart,
	emmiPieChart,
	topboxPieChart,
	url = "emmi.csv",
	colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', "#8c564b", "#e377c2", "#7f7f7f"];

d3.csv(url, function(json) {
	json.forEach(function(d){

		if (d.recived == "TRUE"){
			if (d.viewed == "TRUE"){
				d.emmi = "Viewed";
			}
			else {
				d.emmi = "Didn't View"
			}
		}
		else{
			d.emmi = "Non Emmi"
		}

		if (d.rating > 8){
			d.topBox = "Top Box";
		}
		else{
			d.topBox = "Not Top Box";
		}
	});

	var cases = crossfilter(json);
	
	var volume = cases.dimension(function(d){return d.rating});
	var volumeGroup = volume.group().reduceSum(function(d){return 1;});

	histogramChart = dc.barChart("#histogram");
	histogramChart.width(1100)
		.height(230)
		.margins({top: 10, right: 50, bottom: 30, left: 40})
		.dimension(volume)
		.group(volumeGroup)
		.elasticY(true)
		.centerBar(true)
		.gap(8)
		.round(dc.round.floor)
		.x(d3.scale.linear().domain([0.5, 10.5]))
		.renderHorizontalGridLines(false)
		.yAxis().tickFormat(d3.format("d"));

	var idDimension = cases.dimension(function(d){return d.ID});
	dc.dataTable("#data-table")
		.dimension(idDimension)
		.group(function(d) {return 1;})
		.size(10)
		.columns([
			function(d) { return d.ID; },
			function(d) { return d.LastName; },
			function(d) { return d.gender; },			
			function(d) { return d.doctor; },
			function(d) { return d.unit; },
			function(d) { return d.emmi; },
			function(d) { return d.rating;}])
			.order(d3.ascending);

	//several pie charts are being drawn; this function is used
	function addPieChart(id, key, colors){
		var nature = cases.dimension(function(d){return d[key];});
		var natureGroup = nature.group().reduceSum(function(d){return 1;});

		return dc.pieChart("#" + id)
			.width(250)
			.height(250)
			.transitionDuration(200)
			.radius(120)
			.innerRadius(30)
			.dimension(nature)
			.group(natureGroup)
			.colors(colors)
			.label(function(d){return d.data.key + ": " + d.data.value;});
	}
	unitPieChart = addPieChart('unitPie', 'unit', colors);
	emmiPieChart = addPieChart('emmiPie', 'emmi', colors);
	topboxPieChart = addPieChart('topboxPie', 'topBox', colors);

	dc.renderAll();
});