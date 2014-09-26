(function(){

	var GAME_DATA = {
		data: null,
		q1_template: $('#level-template').html(),
		subquestion_template: $("#subquestion-template").html(),
		result_template: $("#result-template").html(),
		current_level_data: null
	}

	var q1TemplateFactory 				 = _.template(GAME_DATA.q1_template),
			subquestionTemplateFactory = _.template(GAME_DATA.subquestion_template);
			resultTemplateFactory = _.template(GAME_DATA.result_template);

	function getGameData(){
		return $.getJSON('../data/game_data.json');
	}

	function loadGameData(){
		getGameData()
			.done(function(data){
				GAME_DATA.data = data;
			})
	}

	function toggleSplash(){
		$('#game-splash').toggle();
		$('#game-level-container').toggle();
		hideModal();
	}

	function hideModal(){
		$('#game-level-result-modal').hide();

	}

	function loadLevelText(level_data){
		var level_content = q1TemplateFactory(level_data);
		$('#game-level-container').html(level_content)

	}

	function loadSubquestionText(subquestion_data){
		var subquestion_text = subquestionTemplateFactory(subquestion_data);

		$('.game-level-subquestion-container').html(subquestion_text)
	}

	function loadLevel(level_code){
		GAME_DATA.current_level_data = GAME_DATA.data[level_code];
		toggleSplash();

		loadLevelText(GAME_DATA.current_level_data);
	}

	function bindHandlers(){
		$('.game-level').click(function(){
			var level_code = $(this).data('level-select');
			loadLevel(level_code);
		});

		$('#game-wrapper').on('click', '.game-back-to-splash', function(){
			toggleSplash();
		});

		$('#game-level-container').on('click', '.game-level-option', function(){
			$('.game-level-option').removeClass('active');
			$(this).addClass('active');
			var question_selector = $(this).data('level-select'),
			    subquestion_data = GAME_DATA.current_level_data['q'+question_selector];
			loadSubquestionText(subquestion_data);
			hideModal();
		});

		$('#game-level-container').on('click', '.game-level-subquestion', function(){
			$('.game-level-subquestion').removeClass('active');
			$(this).addClass('active');
			var result_text   = $(this).data('result-text'),
					solitary_text = $(this).data('solitary'),
					result_bool   = $(this).data('result-bool');

			console.log(result_bool)

			var obj = {
				result: result_text,
				solitary: solitary_text,
				result_bool: result_bool
			}

			var result_window_text = resultTemplateFactory(obj);

			$('#game-level-result-modal').html(result_window_text).show();
		});

	}

	function startTheGame(){
		loadGameData();
		bindHandlers();
	}

	startTheGame();

}).call(this)