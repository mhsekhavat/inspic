(function($) {

	function htmlToModel(html) {
		var $html = $(html);
		if ($html.attr('inspic_version'))
			v1(html, $html);
	}


	inspic.htmlToModel = htmlToModel;

	function v1(html, $el) {

	}

})(jQuery); 