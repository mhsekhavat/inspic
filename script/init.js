(function($){
    function init(src){
        inspic.view.addElements();
        inspic.view.addPreviews();
        inspic.loadCookie();
        inspic.controller.setField('src', src);
    };
    inspic.init=init;
})(jQuery);