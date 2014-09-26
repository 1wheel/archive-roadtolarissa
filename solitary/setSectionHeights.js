var introPx = 20,
		enterPx = 30,
		exitPx = 10;

var data = [
	{sound: 'sound/2.mp3', name: 'Mental Toll', 			duration: 20*35, onView: runOnlyOnce(playVideo)},
	{sound: 'sound/4.mp3', name: 'Time Alone', 				duration: 20*46, onView: runOnlyOnce(drawBars)},
	{sound: 'sound/7.mp3', name: 'Conditions', 				duration: 20*28, 	onView: runOnlyOnce(function(){ console.log('testFun'); })},
	{sound: 'sound/9.mp3', name: 'Ineffective', 			duration: 20*23, onView: function(){}},
	{sound: 'sound/10.mp3', name: 'Costly', 					duration: 20*28, onView: function(){}},
	{sound: 'sound/12.mp3', name: 'Damage', 					duration: 20*29, onView: function(){}},
	{sound: 'sound/10.mp3', name: 'Reform', 					duration: 20*13, onView: function(){}},
	{sound: '', 					 name: 'Game', 							duration: 4000, onView: function(){}},
	{sound: '', 					 name: 'About', 						duration: 400, onView: function(){}}
];

data.forEach(function(d, i){
	var previousDurations = d3.sum(data
		.filter(function(d, j){ return j < i; })
		.map(function(d){ return d.duration }));
	d.offset = (enterPx + exitPx)*i + previousDurations + introPx;
});

function runOnlyOnce(fun){
	var ranAlready = false;
	return function(){
		if (ranAlready){ return; }
		ranAlready = true;
		fun();
	}
}

var sectionDivs = d3.selectAll('.sectionDiv')
		.data(data)
		.each(function(d, i){
			var offset = d.offset;

			d3.select(this)
					.attr(str(offset), "top:100%")
					.attr(str(offset+1), "top:0%;opacity:0;")
					.attr(str(offset += enterPx), "top:0%;opacity:1")
					.attr(str(offset += d.duration), "top:0%;display:block;opacity:1;")
					.attr(str(offset += exitPx), "top:0%;display:none;opacity:0")
				.append('audio')
					.attr('src', function(d, i){ return d.sound; })
		});
function str(d){ return 'data-' + d; }

var sectionLinks = d3.select('#progress').selectAll('.sectionLinks')
		.data(data).enter()
	.append('a')
		.classed('headerLink', true)
		.text(function(d, i){ return d.name; })
		.on('click', function(d, i){ 
			window.scrollTo(0, d.offset + enterPx);
			scrollUpdate();
		});


skrollr.init();

var lastScroll;
var currentlyPlaying = false;
d3.selectAll('#playButton,#headerPlay').on('click', function(){
	console.log('playClicked');
	currentlyPlaying = !currentlyPlaying;
	if (currentlyPlaying){
		lastScroll = $('body').scrollTop();
		$('body,html').animate({scrollTop: document.height}, (1 - $('body').scrollTop()/document.height)*document.height*30); 
	}
	else{
		$('body,html').stop();
	}
	d3.select('#headerPlay').text(currentlyPlaying ? '■' : '▶');//❚');
});

$(window).scroll(scrollUpdate);


function scrollUpdate(){
	var scrollPos = $('body').scrollTop()
	if (Math.abs(scrollPos - lastScroll) > 10){
		console.log('stopping scroll')
		d3.select('#headerPlay').text('▶');
		$('body,html').stop() 
	}
	lastScroll = scrollPos;

	var currentSection = '';
	sectionDivs.each(function(d, i){ 
		if (d.offset + enterPx <= scrollPos && scrollPos < d.offset + enterPx + d.duration){
			console.log(d.name);
			d3.select(this).select('audio').node().play();
			d.onView();
			currentSection = d.name;
		}
		else{
			d3.select(this).select('audio').node().pause();			
		}
	});
	sectionLinks
			.style('text-decoration', function(d, i){ return d.name == currentSection ? 'underline' : ''; })
}


//on load stuff
var introDuration = 2000;
var introNum = d3.selectAll('.introDiv').transition()
		.delay(function(d, i){ return i*introDuration; })
		.duration(introDuration)
		.style('opacity', 1)
	.size();
// d3.select('#progress').transition()
// 		.delay(introDuration*introNum)
// 		.duration(introDuration)
// 		.style('opacity', 1);
scrollUpdate();
