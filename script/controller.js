(function($) {
    var controller=inspic.controller = {};
    var model = inspic.model.mainModel;

    function numberize(s){
	if (_.isNumber(s))
	    return s;
	//persian letters:
	s=s.replace(/[\u06f0-\u06f9]/g, function(c){ return String.fromCharCode(c.charCodeAt(0)-1776+48); });

	return parseFloat(s.replace(/[^\d\-\.]/g,''));
    }

    function set(field,val){
	model.set(field,val);
    }

    function get(field){
	return model.get(field);
    }
    
    function setField(field,value,e){
	var setter;
	if (typeof(model.defaults[field])=="number")
	    value=numberize(value);
	if (_.isNaN(value))
	    return;
	if (setter=modelFieldSetters[field]){
	    setter.call(model,value,e);
	} else {
	    set(field,value);
	} 
    }
    controller.setField=setField;
    controller.handleDefaultInputFieldChange=setField;

    function bayanSizedUrl(url, size){
	return url.replace(/\?.*$/,'')+'?'+size;
    }
    controller.bayanSizedUrl=bayanSizedUrl;

    var modelFieldSetters = {
	//in all these functions, this is equal to model
	'src' : function(url) {
	    var newImg = $(new Image()).hide().appendTo('body');
	    newImg.load(function() {
		set('isLoading', false);
		set('src', url);
		set('src.width', newImg.width());
		set('src.height', newImg.height());
		set('height', newImg.height());
		set('width', newImg.width());
		var bayan = url.match(/^(https?:\/\/)?(www\.)?bayanbox\.ir\/[^?]*(\?(thumb|image_preview|view))?$/);
		if (bayan) {
		    set('src.bayan', true);
		    var matchedSize = bayan[4];
		    set('src.bayan.size', matchedSize || null);
		} else {
		    set('src.bayan', false);
		}
	    }).error(function() {
		set('isLoading', false);
		set('src', null);
		set('src.bayan', false);
		alert('آدرس تصویر معتبر نیست');
	    });
	    newImg.attr('src', url);
	    set('isLoading', true);
	},

	'src.bayan.size': function(size){
	    if (!get('src.bayan'))
		return;
	    setField('src',bayanSizedUrl(get('src'), size));
	},

	'width': function(val){
	    val=numberize(val);
	    val=Math.round(val);
	    set('width', val);
	    if (get('keep_ratio'))
		set('height', Math.round(val*get('src.height')/get('src.width')));
	},
	
	'height': function(val){
	    val=numberize(val);
	    val=Math.round(val);
	    set('height', val);
	    if (get('keep_ratio'))
		set('width', Math.round(val*get('src.width')/get('src.height')));
	},

	'keep_ratio': function(val){
	    set('keep_ratio', val);
	    if (val)
		setField('width', get('width'));
	},
	
	'position': function(val){
	    set('position', val);
	    var sep=val.split('_');
	    set('position.clearfix', sep[0]=='block');
	    set('position.textAlign', sep[0]=='block' ? sep[1] : null);
	    set('position.float', sep[0]=='block' ? 'none' : sep[1]);
	    if (!get('margin.adv'))
		set('margin.base', val=='inline_none' ? 3 : 10);
	},
	
    };
    
})(jQuery);
