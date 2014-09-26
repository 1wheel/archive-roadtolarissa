function drawBars(){
	var $fifteen_bar = $('#bar-fifteen-days .bar-element'),
			$six_bar     = $('#bar-six-years .bar-element'),
			$forty_bar   = $('#bar-forty-years .bar-element');
			bar_elements = [$fifteen_bar, $six_bar, $forty_bar];

	var bar_scale;

	var counter = 0;

	var canvas_width = $('#bar-wrapper').width();
	function showBar($bar_element){
		console.log('showing bar ' + counter++);
		$bar_element.addClass('visible').parents('.bar-group').show();
		var scale = calcScale($bar_element);

		$('.bar-element.visible').each(function(index, el){
			var bar_width = scale( $(el).data('length') );
			$(el).width(bar_width);
		})
		
	}

	// Input the max domain in days, 15 
	function calcScale($el){
		var max_domain = $el.data('length');

		var scale = d3.scale.linear()
									.domain([0, max_domain])
									.range([0, canvas_width]);
		return scale;
	}


	function startTheShow(){

		_.delay(showBar, 1000, bar_elements[counter]);
		counter++
		_.delay(showBar, 3000, bar_elements[counter]);
		counter++
		_.delay(showBar, 6000, bar_elements[counter]);

	}

	startTheShow();

}