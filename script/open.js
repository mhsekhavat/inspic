(function($){
    var body='<div id="insertPicture">'+
        '<div class="tab_headers"></div>'+
        '<div class="tabs">'+
        '<div id="inspic_src" tab_title="مشخصات تصویر"></div>'+
        '<div id="inspic_link" tab_title="پیوند"></div>'+
        '<div id="inspic_position" tab_title="جایگاه در متن"></div>'+
        '<div id="inspic_border" tab_title="کادر و سایه"></div>'+
        '<div id="inspic_caption" tab_title="زیر نویس"></div>'+
        '</div>'+
        '<hr>'+
        '<div class="preview">'+
        '<div class="imagePreview">'+
        '<span> بلاگ رسانه ای است برای متخصصان تا با استفاده از امکانات پیشرفته ، حضور موثرتری در اینترنت داشته باشند. </span>'+
        '<span class="inspic_clearfix"> <span class="pic_margin"> <span class="pic_wrapper"> <span class="pic_border"> <span class="pic_inner"> <span class="pic_caption_inner"></span> <img> </span> </span> <span class="pic_caption_outer"> </span> </span> </span> </span>'+
        '<span> سعی ما در بلاگ بر این است تا به ساده ترین نحو ممکن این فرصت را برای نخبگان، محققان، هنرمندان، اهل قلم و بلاگ نویسان حرفه ای فراهم آوریم تا بتوانند بدون پرداخت هزینه و فارغ از دغدغه های فنی، بر تولید و نشر آثار خود تمرکز کنند. </span>'+
        '</div>'+
        '<div class="loading">'+
        '<img src="/media/images/loading.gif">'+
        '</div>'+
        '</div>'+
        '</div>';

    function open($el, args){
	$el=$($el).html(body);
	inspic.init(args.src || '');
	if (args.html)
	    inspic.setHtml(args.html);
	inspic.callback=args.callback;
    }
    inspic.open=open;
})(jQuery);