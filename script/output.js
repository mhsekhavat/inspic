(function($) {
    var Output=Backbone.View.extend({
	initialize: function(options){
	    var window=this.window=open('output.html','inspic_output', options.specs);
	    var _this=this;
	    this.setElement(window);
	    this.model.on('change', function(){
		window.focus();
		this.render();
	    }, this);
	    
	},

	render: function(){
	    var _this = this;
	    var model=this.model;
	    var p = inspic.pixelize;
	    var g = function(x) {
		return model.get(x);
	    };
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
		g('innerShadow.enable') && inner.inspic('css','box-shadow', g('innerShadow'));

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
		
		var caption = $('<span class="pic_caption_outer">');
		caption.html(g('caption'));
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

	    //Version
	    ph.attr('inspic_version', g('version'));

	    //this.$el.find('body', this.window.document).html(ph);
	    var q=$('#inspic_output',this.window.document).html(ph);
	    $('#inspic_output_code',this.window.document).text(q.html());
	}
    });
    inspic.view.Output=Output;

    $(function(){
	var output=null;
	$('<a href="#">output</a>').prependTo('body').click(function(){
	    if (!output)
		output=new inspic.view.Output({
		    'model':inspic.model.mainModel
		});
	    else{
		output.render();
		output.el.focus();
	    }
	    return false;
	});

    });
})(jQuery);