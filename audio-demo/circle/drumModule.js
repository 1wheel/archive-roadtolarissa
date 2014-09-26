

context = new webkitAudioContext();
function osc(pitch){
    oscillator = context.createOscillator(),
        oscillator.type = 2;
    oscillator.frequency.value = pitch;
    gainNode = context.createGainNode();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    gainNode.gain.value = 1;
    oscillator.noteOn(0);
    oscillator.noteOff(1000);
    return oscillator;
};

var width = 400,
    height = 400;

var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

svg.selectAll("circle")
        .data([100, 200, 300])
    .enter().append("circle")
        .attr("cy", 100)
        .attr("cx", function(d){return d;})
        .attr("r", 20);