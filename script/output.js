(function($) {

    var model=inspic.model.mainModel;
    function g(x){
	var ret=model.get(x);
	var type=typeof(model.defaults[x]);
	if (type=='boolean')
	    ret=(ret ? 1 : '');
	return ret;
    }
    
    function genData(model, g){
	var ret={};

	function getPrefixArray(prefix, fields){
	    return _.map(fields, function(field){
		return g(prefix+field);
	    });
	}

	if (g('src.width')!=g('width') || g('src.height')!=g('height'))
	    ret['src']=getPrefixArray('', ['width', 'height', 'keep_ratio']);

	if (g('href.type')!='none')
	    ret['hrf']=g('href.type');
	
	ret['etc']=getPrefixArray('', ['position','adv']);

	ret['mrg']=getPrefixArray('margin.', ['base','top', 'right', 'bottom', 'left']);

	var shadowFields=['blur','x','y','color','alpha','inset'];
	if (g('innerShadow.enable'))
	    ret['ish']=getPrefixArray('innerShadow.', shadowFields);
	if (g('outerShadow.enable'))
	    ret['osh']=getPrefixArray('outerShadow.', shadowFields);
	
	ret['bdr']=getPrefixArray('border.', ['padding.raw','radius','background']);
	var borderFields=['color','style','width'];
	if (g('borderline.enable')){
	    ret['bdr'].push(getPrefixArray('borderline.', borderFields));
	}

	if (g('caption.enable')){
	    var type=g('caption.type');
	    ret['cap']=getPrefixArray('caption.',['pos','textAlign',type+'.background.color',type+'.background.alpha']);
	    
	    if (type=='inner'){
		ret['cap'].push(getPrefixArray('caption.inner.', ['hpos']));
	    }else{
		ret['cap'].push(getPrefixArray('caption.outer.', ['padding','radius']));
		if (g('caption.outer.border.enable'))
		    ret['cap'].push(getPrefixArray('caption.outer.border.', borderFields));
	    }
	    
	    var formatFields=['type','bold','italic','color.'+type, 'size'];
	    if (g('caption.h1.enable'))
		ret['h1']=getPrefixArray('caption.h1.', formatFields);
	    if (g('caption.p.enable'))
		ret['p']=getPrefixArray('caption.p.', formatFields);
	    
	}
	return ret;
    }
    
     function stringify(data){
	 return _.map(_.keys(data), function(key){
			  return (_.flatten([key, data[key]]).join('|'));
		      }).join(',');	 
     }

     function getHtml(model){
	model=model || inspic.model.mainModel;
	var data={};
	var p = inspic.pixelize;
	var ph; // placeholder
	
	//Image
	var img = $('<img>');
	img.attr('src', g('src'));
	img.inspic('css','width', p(g('width')));
	img.inspic('css','height', p(g('height')));
	if (g('title')) {
	    img.attr('alt', g('title'));
	    img.attr('title', g('title'));
	}
	if (g('border.radius'))
	    img.inspic('css','border-radius', p(g('border.radius.inner')));

	ph = img;

	//InnerShadow and InnerCaption
	if ( g('innerShadow.enable') || (g('caption.inner.enable') && g('caption').trim()) ) {
	    var inner = $('<span class="pic_inner">');
	    inner.append(ph);
	    // InnerShadow
	    if (g('innerShadow.enable'))
		inner.inspic('css','box-shadow', g('innerShadow'));
	    
	    g('border.radius') && inner.inspic('css','border-radius', p(g('border.radius.inner')));

	    // InnerCaption
	    if (g('caption.inner.enable') && g('caption').trim()){
		var caption = $('<span class="pic_caption_inner">');
		caption.html(g('caption').trim());
		caption.inspic('css','text-align',g('caption.textAlign'));
		g('caption.vpos')=='top' && caption.inspic('css','top','0');
		g('caption.vpos')=='bottom' && caption.inspic('css','bottom','0');
		g('caption.inner.hpos').match(/left|full/) && caption.inspic('css','left', '0');
		g('caption.inner.hpos').match(/right|full/) && caption.inspic('css','right', '0');
		caption.inspic('css','background-color', g('caption.inner.background'));
		caption.inspic('css','border-radius', g('caption.inner.radius'));
		
		inner.append(caption);
	    }

	    ph = inner;
	}
	
	//span pic_border
	if ( ( g('border.padding') && (g('innerShadow.enable') || g('caption.inner.enable')) ) || 
	     ( !g('border.padding') && g('outerShadow.enable') && g('innerShadow.enable') ) ){
	    var border= $('<span class="pic_border">');
	    border.append(ph);
	    ph=border;
	}

	//padding and background
	if (g('border.padding')){
	    ph.inspic('css', 'padding', p(g('border.padding')));
	    ph.inspic('css', 'background-color', g('border.background'));
	}

	//radius (outer)
	g('border.radius') && ph.inspic('css', 'border-radius', p(g('border.radius')));
	
	//Borderline and OuterShadow
	g('borderline.enable') && ph.inspic('css', 'border', g('borderline'));
	g('outerShadow.enable') && ph.inspic('css', 'box-shadow', g('outerShadow'));

	//title (outer)
	g('title') && ph.attr('title', g('title'));

	//Anchor (href)
	if (g('href')){
	    if (ph.prop('tagName').toLowerCase()=='span'){
		var code=ph.inspic('outerHtml');
		code=code.replace(/^<span/,'<a').replace(/span>$/,'a>');
		ph=$(code);
	    } else{
		ph=ph.wrap('<a/>').parent();
	    }
	    ph.attr('href', g('href'));
	    g('href.target') && ph.attr('target', g('href.target'));
	}
	
	// OuterCaption and pic_wrapper
	if (g('caption.outer.enable') && g('caption').trim()) {
	    var wrapper = $('<span class="pic_wrapper">');
	    g('caption.outer.border.enable') && wrapper.inspic('css','border', g('caption.outer.border'));
	    wrapper.inspic('css', 'background-color', g('caption.outer.background'));
	    wrapper.inspic('css', 'padding', p(g('caption.outer.padding')));
	    wrapper.inspic('css', 'border-radius', p(g('caption.outer.radius')));
	    //FIXME: width of outerCaption should be calculated by model and must not depend on view! 
	    var width=$('#insertPicture .preview .pic_wrapper').width();
	    width && wrapper.inspic('css', 'width', p(width));
	    
	    var caption = $('<span class="pic_caption_outer">');
	    caption.text(g('caption'));
	    caption.inspic('css', 'color', g('caption.outer.forecolor'));
	    caption.inspic('css', 'text-align', g('caption.textAlign'));

	    wrapper.append(ph);
	    wrapper[g('caption.vpos') == 'top' ? 'prepend' : 'append'](caption);
	    
	    ph = wrapper;
	} 

	//Position
	ph.inspic('css','float', g('position.float'));
	if (g('position.clearfix')) {
	    var margin = $('<span class="pic_clearfix">');
	    margin.inspic('css','text-align', g('position.textAlign'));
	    margin.append(ph);
	    ph = margin;
	}

	//Margin
	ph.inspic('css','margin', g('margin'));

	var data=genData(model,g);
	//Version
	data['ver']=g('version');

	var dataAttr=stringify(data);
	ph.attr('data-inspic', dataAttr);

	 return ph.inspic('outerHtml');
    }
    inspic.getHtml=getHtml;
    
    var Output=Backbone.View.extend({
	initialize: function(options){
	    var window=this.window=open('output.html','inspic_output', options.specs);
	    this.setElement(window);
	    this.model.on('change', function(){
		window.focus();
		this.render();
	    }, this);
	    
	},

	render: function(){
	    var html=getHtml();
	    //this.$el.find('body', this.window.document).html(ph);
	    var q=$('#inspic_output',this.window.document).html(html);
	    $('#inspic_output_code',this.window.document).text(html);
	}
    });
    inspic.view.Output=Output;

    function saveCookie(){
	var data=_.omit(genData(model,g), 'src');
	$.cookie('inspicData', stringify(data));
    }
    inspic.saveCookie=saveCookie;
})(jQuery);