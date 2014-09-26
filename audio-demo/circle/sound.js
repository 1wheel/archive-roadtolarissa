

context = new webkitAudioContext();
function osc(pitch){
	oscillator = context.createOscillator(),
	oscillator.type = 2;
	oscillator.frequency.value = pitch;
	gainNode = context.createGainNode();
	oscillator.connect(gainNode);
	gainNode.connect(context.destination);
	gainNode.gain.value = 0;
	oscillator.start(1);
	return {osc: oscillator, gain: gainNode};
};

function createPitchArray(p){
	var rv = [];
	p.forEach(function(d){
		var pitch = osc(d);
		pitch.hz = d
		pitch.clicked = false;
		rv.push(pitch);
	}); 
	return rv;
}
var pitchNums = [130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63],
	pitches = createPitchArray(pitchNums);

var width = 400,
	height = 800;

var svg = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("fill", "grey")
		.attr("stroke", "grey")
		.attr("stroke-width", 4)
		.text("H");

svg.selectAll("circle")
		.data(pitches)
	.enter().append("circle")
		.attr("cy", function(d){return 1000 - 3*d.hz;})
		.attr("cx", 200)
		.attr("r", 20)
		.on("mouseover", function (d){
			d.gain.gain.value = 1;
			d3.select(this)
					.attr("fill", "lightblue")
				.transition()
					.duration(500)
					.attr("fill", "steelblue");
		})
		.on("mouseout", function (d){
			d.gain.gain.value = d.clicked ? 1 : 0;
				d3.select(this)
				.transition()
					.duration(500)
					.attr("fill", "grey");
		})
		.on("click", function(d){
			d.clicked = !d.clicked;
			d3.select(this).attr("stroke", d.clicked ? 'steelblue' : 'grey');
			d.gain.gain.value = d.clicked ? 1 : 0;
		});

