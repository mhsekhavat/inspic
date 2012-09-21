(function($) {
    inspic.model = {};
    
    function ComputedField(depends,func){
	this.depends=depends || [];
	this.func=func || function(){;};
    }
    
    ComputedField.prototype={
	registerBackboneHandlers: function(model,field){
	    this.model=model;

	    var depends=this.depends,
	    func=this.func;

	    var handler=function(){
		var args=_.map(depends, model.get, model);
		model.set(field,func.apply(model, args));
	    };
	    this.handler=handler;

	    _.each(depends, function(val){
		model.on('change:'+val, handler, model);
	    });
	    return handler;
	},
	
	unregisterBackboneHandlers: function(){
	    this.model.off(null, this.func);
	}
    };
    inspic.model.ComputedField=ComputedField;
    
    var MainModel = Backbone.Model.extend({
	initialize: function(){
	    Backbone.Model.prototype.initialize.apply(this, arguments);
	    !this.computed || (_.each(this.computed, function(val, key){
		var func=val.registerBackboneHandlers(this,key);
		func.call(this);
	    },this));
	    
	},

	/**
	 *Sample: subscribe('!`src.bayan` && `href.type`=="url"', function(val){ console.log(val, this); }, taghi)
	 * will subscribe the function(val) to changes of src.bayan and href.type and call it with (this=taghi) and (val=~src.bayan && href.type=="url") on each change.
	 */
	subscribe: function(expr, onChange, context){
	    if (!expr || !onChange)
		return;
	    context=context || this;
	    var model=this;
	    var changes,handler; 

	    if (expr.search('`')>-1){
		/* if expr had `model fields`, subscribe to change of all of them and substitute for calls */

		//string for changes of `model fields` appeared in expr
		changes=_.reduce(_.uniq(expr.match(/`[^`]*`/g) || []), function(memo, field){ return memo+'change:'+field.substring(1, field.length-1)+' '; },'');

		handler=function(){

		    //substitued `model fields` with their values
		    var substituted=expr.replace(/`([^`]*)`/g, function(matched,$1){ 
			var ret=model.get($1); 
			if (typeof(ret)=='string') 
			    ret='"'+ret+'"';
			else if (typeof(ret)=="undefined")
			    ret=null;
			return ret;
		    });

		    onChange.call(context, substituted);
		};
	    } else { 
		/*if expr is just a single field of model, subscribe to its changes */
		changes='change:'+expr;
		handler=function(){
		    onChange.call(context, model.get(expr));
		};
	    }

	    model.on(changes, handler, this);
	    return handler;
	},

	/*****************************************************************************************************/

	defaults : {
	    'version': 1,
	    'isLoading' : false,
	    'src' : null,
	    'src.adv': false,
	    'src.width' : 0,
	    'src.height' : 0,
	    'src.bayan' : false,
	    'src.bayan.raw_url' : undefined,
	    'src.bayan.size' : undefined,
	    'width' : null,
	    'height' : null,
	    'keep_ratio' : true,
	    'href': null,
	    'href.type': 'src',
	    'href.url': '',
	    'href.target': '_blank',
	    'title': '',
	    'position': 'float_right',
	    'position.float': 'right',
	    'margin.base': 10,
	    'margin.adv': false,
	    'margin.left': 10,
	    'margin.right': 10,
	    'margin.top': 10,
	    'margin.bottom': 10,
	    'innerShadow.enable':true,
	    'innerShadow.inset': true,
	    'innerShadow.blur': 10,
	    'innerShadow.color': '#000',
	    'innerShadow.x': 0,
	    'innerShadow.y': 0,
	    'innerShadow.alpha': 1,
	    'outerShadow.enable':true,
	    'outerShadow.inset': false,
	    'outerShadow.blur': 3,
	    'outerShadow.color': '#000',
	    'outerShadow.x': 0,
	    'outerShadow.y': 0,
	    'outerShadow.alpha': 1.0,
	    'borderline.enable': false,
	    'borderline.color':'#000',
	    'borderline.style':'solid',
	    'borderline.width':1,
	    'border.padding.raw':3,
	    'border.radius':5,
	    'border.background':'#fff',
	    'caption.enable':false,
	    'caption.pos':'inner_top',
	    'caption.textAlign':'center',
	    'caption.h1.enable': true,
	    'caption.h1.text':'',
	    'caption.h1.type':'',
	    'caption.h1.bold':false,
	    'caption.h1.italic':false,
	    'caption.h1.color.inner':'#eee',
	    'caption.h1.color.outer':'#000',
	    'caption.h1.size':14,
	    'caption.p.text':'',
	    'caption.p.enable':false,
	    'caption.p.bold':false,
	    'caption.p.italic':false,
	    'caption.p.color.inner':'#eee',
	    'caption.p.color.outer':'#000',
	    'caption.p.size':10,
	    'caption.adv':false,
	    'caption.inner.hpos':'full',
	    'caption.inner.background.color':'#000',
	    'caption.inner.background.alpha':0.7,
	    'caption.outer.background.color':'#fff',
	    'caption.outer.background.alpha':1,
	    'caption.outer.forecolor':'#000',
	    'caption.outer.border.enable':false,
	    'caption.outer.border.style':'solid',
	    'caption.outer.border.width':1,
	    'caption.outer.border.color':'#000',
	    'caption.outer.padding':3,
	    'caption.outer.radius':0
	},
	
	computed: {
	    'href': new ComputedField(
		['src','href.type','href.url'],
		function(src, type, url){
		    if (type=='none')
			return null;
		    else if (type=='src')
			return src;
		    else if (type=='big')
			return inspic.controller.bayanSizedUrl(src, 'view');
		    else if (type=='url')
			return url;
		}),
	    'margin': new ComputedField(
		['margin.base','margin.adv','margin.top', 'margin.right','margin.bottom','margin.left','position','outerShadow.enable','outerShadow.blur','outerShadow.x','outerShadow.y'],
		function(base,         adv,         top,          right,         bottom,         left,  pos,       shadow,              blur,              x,              y){
		    var t,r,b,l;
		    if (!adv){
			t=r=b=l=base || 0;
			if (pos.match(/_right/))
			    r=0;
			else if (pos.match(/_left/))
			    l=0;
			if (shadow){
			    t+=Math.max(0, blur-y);
			    r+=Math.max(0, blur+x);
			    b+=Math.max(0, blur+y);
			    l+=Math.max(0, blur-x);
			}
		    } else {
			t=top;
			r=right;
			b=bottom;
			l=left;
		    }
		    return inspic.tlbr(t,l,b,r);
		}),
	    'innerShadow': shadowField('innerShadow.'),
	    'borderline': borderField('borderline.'),
	    'outerShadow': shadowField('outerShadow.'),
	    'border.padding': new ComputedField(
		['border.padding.raw', 'outerShadow.enable', 'borderline.enable'],
		function(val,           shadow,               line){
		    return (shadow || line ? val : 0);
		}),
	    'border.radius.inner': new ComputedField(
		['border.radius', 'border.padding'],
		function(radius, padding){
		    if (!padding)
			return radius;
		    return (radius<6 ? Math.round(radius/2) : radius-3);
		}),
	    'caption.h1.style': textFormattingField('caption.h1.'),
	    'caption.h1.enable': new ComputedField(
		['caption.h1.type'],
		function(type){
		    return (type!='');
		}),
	    'caption.h1': new ComputedField(
		['caption.h1.type', 'caption.h1.text', 'title', 'caption.h1.style'],
		function(    type,              text,   title,              style){
		    var ret='';
		    if (type=='text')
			ret=text;
		    else if (type=='title')
			ret=title;
		    return (ret ? '<h1 style="'+style+'">'+ret+'</h1>' : '');
		}),
	    'caption.p.style': textFormattingField('caption.p.'),
	    'caption.p': new ComputedField(
		['caption.p.enable', 'caption.p.text', 'caption.p.style'],
		function(enable,                text,             style){
		    return (enable && text ? '<p style="'+style+'">'+text+'</p>' : '');
		}),
	    'caption': new ComputedField(
		['caption.p', 'caption.h1'],
		function(p, h1){
		    return h1+p;
		}),
	    'caption.type': new ComputedField(
		['caption.pos'],
		function(pos){
		    return (pos=='inner_top' || pos=='inner_bottom' ? 'inner' : 'outer');
		}),
	    'caption.vpos': new ComputedField(
		['caption.pos'],
		function(pos){
		    return (pos=='inner_top' || pos=='outer_top' ? 'top' : 'bottom');
		}),
	    'caption.inner.enable': new ComputedField(
		['caption.enable', 'caption.type'],
		function(enable, type){
		    return (enable && type=='inner');
		}),
	    'caption.outer.enable': new ComputedField(
		['caption.enable', 'caption.type'],
		function(enable, type){
		    return (enable && type=='outer');
		}),
	    'caption.inner.radius': new ComputedField(
		['border.radius.inner', 'caption.vpos', 'caption.inner.hpos'],
		function(radius,         vpos,           hpos){
		    var tl,tr,br,bl;
		    tl=tr=br=bl=radius;
		    vpos=='top' ? (br=bl=0) : (tl=tr=0);
		    hpos=='full' || (hpos=='left' ? (tr=br=0) : (tl=bl=0));
		    return _.map([tl,tr,br,bl], inspic.pixelize).join(' ');
		}),
	    'caption.inner.background': colorField('caption.inner.background.'),
	    'caption.outer.background': colorField('caption.outer.background.'),
	    'caption.outer.border': borderField('caption.outer.border.'),
	    'caption.p.color': new ComputedField(
		['caption.type', 'caption.p.color.inner', 'caption.p.color.outer'],
		function(type,                  inner,                 outer){
		    return (type=='inner' ? inner : outer);
		}),
	    'caption.h1.color': new ComputedField(
		['caption.type', 'caption.h1.color.inner', 'caption.h1.color.outer'],
		function(type,                  inner,                 outer){
		    return (type=='inner' ? inner : outer);
		})

	}
    });

    function colorField(prefix){
	//TODO: use it in shadowField and borderField
	return new ComputedField(
	    [prefix+'color', prefix+'alpha'],
	    function(color,alpha){
		return inspic.alphaColor(color || '#000', alpha);
	    }
	);
    }

    function shadowField(prefix){
	return new ComputedField(
	    _.map(
		['enable','x','y','blur','color','alpha','inset'],
		function(field){ return prefix+field; }
	    ),
	    function(enable, x, y, blur, color, alpha, inset){
		if (!enable)
		    return '';
		var p=inspic.pixelize;
		color=inspic.alphaColor(color || '#000', alpha);
		inset= inset ? 'inset' : '';
		return [p(x),p(y),p(blur),color,inset].join(' ');
	    }
	);
    }

    function borderField(prefix){
	return new ComputedField(
	    _.map(
		['enable','style','width','color','alpha'],
		function(field){ return prefix+field; }
	    ),
	    function(enable, style, width, color, alpha){
		var p=inspic.pixelize;
		if (!enable)
		    return '';
		if (!width && !_.isNumber(width))
		    width=1;
		if (style=='double' && width<3)
		    width=3;
		var ret=[p(width), style, inspic.alphaColor(color || '#000', alpha)].join(' ');
		return ret;
	    }
	);
    }
    
    function textFormattingField(prefix){
	return new ComputedField(
	    _.map(
		['bold','italic','color','size'],
		function(field){ return prefix+field; }
	    ),
	    function(bold,italic,color,size){
		bold=(bold ? 'bold' : 'normal');
		italic=(italic ? 'italic' : 'normal');
		color=color || '#000';
		size=inspic.pixelize(size || 10);
		return "font-weight:"+bold+"; font-style:"+italic+"; color:"+color+"; font-size:"+size;
	    }
	);
    }

    inspic.model.MainModel = MainModel;
    inspic.model.mainModel = new MainModel();
})(jQuery);