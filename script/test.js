(function($){
    var model=inspic.model.mainModel;
    test1=function(){
	var a=inspic.getHtml();
	for (var attr in model.defaults){
	    model.set(attr, '');
	}
	inspic.setHtml(a);
    };
})(jQuery);