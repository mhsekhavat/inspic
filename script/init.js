(function($){
    function init(src){
        inspic.view.addElements();
        inspic.view.addPreviews();
        inspic.loadCookie();
        if (!_.isUndefined(src))
            inspic.controller.setField('src', src);
    };
    inspic.init=init;
})(jQuery);