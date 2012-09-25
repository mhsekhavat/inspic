/*
 * Insert Picture Module
 * MVC pattern. order of importing javascript modules is important:
 * inspic.js -> model.js -> controller.js -> view.js
 */
var inspic = {};

function inspicEval(expr){
    //console.log(expr);
    return eval(expr);
}

(function($) {
    //IE does not support trim
    if(typeof String.prototype.trim !== 'function') {
	String.prototype.trim = function() {
	    return $.trim(this);
	};
    }

    function Scroller(callback,context) {//returns a div
	var element=$('<div>');
	var mouseDown = false;
	element.css({
	    display : ($.browser.msie ? 'inline' : 'inline-block'),
	    position : 'relative',
	    width : 104,
	    height : 15
	}).append('<img src="images/slider.gif">');
	$('<span>').css({
	    borderWidth : 1,
	    borderStyle : 'solid',
	    position : 'absolute',
	    width : 7,
	    height : 7,
	    borderRadius : 5,
	    backgroundColor : '#ffa500',
	    top : 4,
	    display : 'block'
	}).appendTo($('<div>').css({
	    position : 'absolute',
	    borderWidth : 0,
	    borderStyle : 'solid',
	    width : 70,
	    height : 15,
	    left : 13,
	    top : 0,
	    overflow : 'hidden',
	    paddingBottom: 3
	}).bind('mousedown', function() {
	    mouseDown = true;
	}).bind('mouseup mouseover', function() {
	    mouseDown = false;
	}).bind('mousemove mousedown', function(e) {
	    if (mouseDown) {
		var val = (e.pageX - $(this).offset().left - 5);
		var rel = (val + 0.0) / $(this).width();
		if (rel < 0 || rel > .9)
		    return;
		rel = rel / 0.9;
		$(this).find('span').css('left', val);
		callback.call(context,rel);
	    }
	}).appendTo(element));
	$.fn.setScrollerValue = function(val) {
	    $(this).find('span').css('left', val * 0.9 * ($(this).find('div').width()));
	};
	return element;
    }
    inspic.scroller=Scroller;

    var iconSelectTem=_.template($('#inspic_tem_selectItem').html());
    function iconSelect(field){
	$.each(this, function(){
	    var $select=$(this);
	    var items={};

	    $select.find('option').each(function(){
		var $option=$(this);
		items[$option.attr('value')]=$option.text();
	    });

	    var $el=$(iconSelectTem({'items':items})).insertAfter($select);
	    if (field)
		$el.attr('field',field);
	    $select.hide();

	    $el.on('click', '.iconSelectItem', function(){
		var $this=$(this);
		$select.val($this.attr('value')).change();
	    });
	    $select.change(function(e){
		$el.find('.selected').removeClass('selected');
		$el.find('[value="'+$select.val()+'"]').addClass('selected');
	    });
	    $select.change();
	});
	return this;
    }

    var spinnerTem=$('#inspic_tem_spinner').html();
    function spinner(args){
	args=_.extend({
	    step:1,
	    min:0,
	    max:50
	}, args);

	$.each(this, function(){
	    var $text=$(this);

	    function changeStep(inc){
		var step=args.step;
		var delta=(inc ? step : -step);
		var val=parseFloat($text.val())+delta;
		var min=args.min, max=args.max;
		if (_.isNaN(val))
		    return;
		_.isNaN(min) || (val=Math.max(val, min));
		_.isNaN(max) || (val=Math.min(val, max));
		(val%1===0) || (val=val.toFixed(2));
		$text.val(val).change();
	    }

	    $text.keypress(function(e){
		if (e.keyCode!=38 && e.keyCode!=40)
		    return;
		changeStep(e.keyCode==38);
	    });

	    $text.width($text.width()-11);
	    var $spinner=$(spinnerTem);
	    $text.after($spinner);
	    $spinner.find('.inspic_up').click(function(){
		changeStep(true);
	    });
	    $spinner.find('.inspic_dn').click(function(){
		changeStep(false);
	    });
	});
	return this;
    }

    function tabularize(header,focus){
	var $header=$(header);
	var $tabs=this;
	focus = focus || 0;
	$.each(this, function(index){
	    var $tab=$(this);
	    $header.append($('<span>', {
		text:$tab.attr('tab_title'),
		'for':$tab.attr('id'),
		click: function(){
		    if ($(this).inspic('disabled'))
			return;
		    $tabs.hide();
		    $tab.show();
		    $(this).addClass('selected').siblings().removeClass('selected');
		}
	    }));
	});
	$header.find('span:first').click();
	return this;
    }

    var jQueryFunctions = {
	val : function(value) {
	    if (_.isUndefined(value)) {
		var el = this.first();
		if (el.is('input[type="checkbox"]'))
		    return (el.attr('checked') == 'checked' ? true : false);
		return el.val();
	    } else {
		$.each(this, function() {
		    var $this = $(this);
		    if ($this.is('input[type="checkbox"]')) {
			if (value)
			    $this.attr('checked', 'checked');
			else
			    $this.removeAttr('checked');
		    } else {
			$this.val(value);
		    }

		});
		return this;
	    }
	},

	disabled : function(value) {
	    var $this=$(this);
	    if (arguments.length==0)
		return ($this.attr('disabled')=='disabled');
	    if (value)
		$this.attr('disabled', 'disabled');
	    else
		$this.removeAttr('disabled');
	    return this;
	},

	'iconSelect': iconSelect,
	'spinner': spinner,
	'tabularize': tabularize,

	css: function(val,key){
	    if (_.isUndefined(key) || _.isNull(key))
		return;
	    var ret=this.attr('style');
	    ret=(ret ? ret+' ' : '');
	    ret=ret+(_.isUndefined(key) ? val : val+':'+key.trim()+';');
	    return this.attr('style', ret);
	},
	outerHtml: function(){
	    return $('<div>').append($(this).clone()).html();
	}
    };


    $.fn.inspic = function(method) {
	return jQueryFunctions[method].apply(this, Array.prototype.slice.call(arguments, 1));
    };

    inspic.pixelize=function(x){
	return (x ? x+'px' : '0');
    };

    inspic.colorToRgba= function(color){
	var hex = color.match(/#([a-f\d]{1,2})([a-f\d]{1,2})([a-f\d]{1,2})$/);
	if (hex){
	    hex=_.map(hex, function(val){
		return parseInt((val.length==1 ? val.toString()+val.toString() : val), 16);
	    });
	    return {r:hex[1], g:hex[2], b: hex[3], a:1};
	}
	var rgba = color.match(/rgba?\((\d{1,3}),(\d{1,3}),(\d{1,3})(,([.\d]*))?\)/);
	var alpha=(rgba[5]==='0' || rgba[5] ? rgba[5] : 1);
	if (rgba)
	    return {r:parseInt(rgba[1]), g:parseInt(rgba[2]), b:parseInt(rgba[3]), a:alpha};
	if (color=='transparent')
	    return {r:255, g:255, b:255, a:0};
	return '';
    };

    inspic.rgbaToColor = function(rgba){
	var rgb=[rgba.r,rgba.g,rgba.b];
	if (rgba.a===0)
	    return 'transparent';
	else if (!rgba.a || rgba.a==1)
	    return _.reduce(rgb, function(memo,val){
		val || (val=0);
		val=val.toString(16);
		return memo+(val.length==1?'0':'')+val;
	    }, '#');
	else
	    return 'rgba('+rgb.join(',')+','+rgba.a+')';
	return '';
    };

    inspic.alphaColor= function(color, alpha){
	var ret=inspic.colorToRgba(color);
	ret.a=alpha;
	return inspic.rgbaToColor(ret);
    };

    inspic.tlbr=function(t,l,b,r){
	var p=inspic.pixelize;
	if (t==r && r==b && b==l)
	    return p(t);
	else if (t==b && r==l)
	    return p(t)+' '+p(r);
	else
	    return p(t)+' '+p(r)+' '+p(b)+' '+p(l);
    };
    /*$.fn.extend({iconSelect: function(input){
	this.each(function(){
	    $(this).on('click', '.iconSelectItem', function(){
		$(this).parents('.iconSelect').val($(this).val()).trigger('manualChange');
	    }).on('manualChange', function(){
		$(this).find('.selected').removeAttr('selected');
		$(this).find('.iconSelectItem[value='+$(this).val()+']').addClass('selected');
	    }).trigger('manualChange');
	});
    }});*/
})(jQuery);