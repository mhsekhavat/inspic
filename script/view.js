(function($) {
    inspic.view = {};
    var mainModel = inspic.model.mainModel;

    //load templates for later use from index.html
    var templates={};
    $('[inspic_tem]').each(function(){
	var $this=$(this);
	templates[$this.attr('inspic_tem')]=_.template($this.html());
    });

    var InputField = Backbone.View.extend({
	tagName : 'span',
	className: 'inspic_inputfield',
	updateValue: function(val){
	    this.$('input,select').inspic('val', val);
	},

	updateDisability: function(){
	    this.$('*').inspic('disabled', this.model.get('isLoading'));
	},

	initialize : function(field, template, args) {
	    args || (args={});
	    var model = this.model = mainModel;
	    this.field = field;

	    //subscribe to model's change
	    //model.on('change:' + field, this.updateValue, this);

	    //disable elements when loading image 
	    //args.alwaysEnabled || model.on('change:isLoading', this.updateDisability, this);
	    
	    !args.events || (this.events = args.events);

	    this.render(field, template, args);
	    
	    field && model.subscribe(field, this.updateValue, this)();

	    var criteria = args.visibilityCriteria;
	    if (criteria){
		var $el=this.$el;
		model.subscribe(criteria, function(substituted){
		    //jQuery has bug: display:block will be set by .show() function
		    //$el[_.isEmpty(causes) ? 'show' : 'hide'].call($el);
		    //console.log(substituted);
		    $el.css('display', inspicEval(substituted) ? 'inline-block' : 'none');
		})();
	    }

	    !args.subscribe || _.each(args.subscribe, function(val,key){
		model.subscribe(key, val, this)();
	    },this);

	    !args.initialize || (args.initialize.call(this, model));
	},

	events : {
	    "change input" : "onChange",
	    "keyup input" : "onChange",
	    "change select" : "onChange"
	},

	iconsDir: 'images/icon/',

	render : function(field, template, args) {
	    var data=_.pick(args, 'text', 'icon', 'options');
	    !data.icon || (data.icon=this.iconsDir+data.icon);
	    var variables = {
		id : _.uniqueId('inspic_'),
		'data' : data
	    };
	    variables.label=templates['label'](variables);
	    this.$el.html(templates[template](variables));
	    this.$el.attr({
		'field':this.field,
		'title': (args.text || '').replace(/:$/,'')
	    });

	    var width=args.width || 30;

	    (width=='long') && (width=250);
	    this.$('input[type="text"]').css({
		'width':width+'px',
		'text-align': args.textAlign || 'center',
		'direction': (args.textAlign=='right' ? 'rtl' : 'ltr')
	    });
	    
	    typeof(this.model.defaults[field])!="number" || args.noSpinner || this.$el.find('input').inspic('spinner', args.spinnerArgs);
	},

	onChange : function(e) {
	    inspic.controller.handleDefaultInputFieldChange(this.field, $(e.target).inspic('val'), this, e);
	}
    });

    /***************************************************************************************************************/

    function appendTo(container){
	return function ret(element){
	    ret.container=container;
	    if (!element)
		return ret;
	    !(element.el) || (element=element.el);
	    $(element).appendTo(container);
	    return ret;
	};
    }

    function addSrcElements() {

	appendTo('#inspic_src')
	(
	    new InputField('src', 'text', {
		text : 'آدرس:',
		width: 'long',
		textAlign: 'left',
		events : {
		    "change input" : "onChange"
		}
	    })
	)(
	    new InputField('title', 'text', {
		text: 'عنوان:',
		width: 'long',
		textAlign: 'right',
		visibilityCriteria: '`src`'
	    })
	)(
	    '<br>'
	)(
	    new InputField('src.bayan.size', 'select', {
		text : 'اندازه:',
		options : {
		    'کوچک' : 'thumb',
		    'متوسط' : 'image_preview',
		    'کامل' : 'view'
		},
		visibilityCriteria : '`src.bayan` && `src`'
	    })
	)(
	    function(){
		var scroller=inspic.scroller(function(val){
		    inspic.controller.setField('width', val*1000);
		});
		mainModel.subscribe('width', function(width){
		    scroller.setScrollerValue(width/1000);
		})();
		mainModel.subscribe('src', function(val){
		    scroller[val ? 'show' : 'hide']();
		})();

		return scroller;
	    }()
	)(
	    new InputField('width', 'text', {
		visibilityCriteria: '`src.adv` && `src`',
		text: 'پهنا:'
	    })
	)(
	    new InputField('height', 'text', {
		visibilityCriteria: '`src.adv` && `src`',
		text: 'ارتفاع:'
	    })
	)(
	    new InputField('keep_ratio', 'checkbox',{
		visibilityCriteria: '`src.adv` && `src`',
		text: 'حفظ تناسب ابعاد'
	    })
	);

	appendTo('#inspic_link')
	(
	    new InputField('href.type', 'select', {
		text: 'مقصد پیوند:',
		options : {
		    'بدون پیوند': 'none',
		    'تصویر': 'src',
		    'اندازه کامل': 'big',
		    'url': 'url'
		},
		subscribe:{
		    '`src.bayan` && `src.bayan.size`!="view"': function(substituted){
			this.$('option[value="big"]')[inspicEval(substituted) ? 'show' : 'hide']();
		    }
		}
	    })
	)(
	    new InputField('href.url', 'text', {
		width: 'long',
		textAlign: 'left',
		subscribe: {
		    '`href.type`': function(substituted){
			substituted=='"url"' ? this.$('input').css('display','inline-block').focus().select() : this.$('input').hide();
		    }
		}
	    })
	)(
	    new InputField('href', 'text', {
		width: 'long',
		textAlign: 'left',
		alwaysEnabled: true,
		visibilityCriteria: '`href.type`!="url" && `href.type`!="none"',
		initialize: function(){ this.$('input').inspic('disabled',true); }
	    })
	)(
	    new InputField('href.target', 'select', {
		text: 'محل باز شدن:',
		visibilityCriteria: '`href.type`!="none" && `src.adv`',
		options: {
		    'صفحه جدید': '_blank',
		    'صفحه فعلی': '_self'
		}
	    })
	); 
    }
/***********************************************************************/

    function addPositionElements(){

/*	appendTo('#inspic_position>legend')(
	    new InputField('margin.adv', 'checkbox', {
		text: 'پیشرفته',
		initialize: function(){
		    this.$el.css('float','left');
		}
	    })
	);*/

	appendTo('#inspic_position')(
	    new InputField('position', 'select', {
		//		text: 'چینش:',
		options:{
		    'راست': 'inline_right',
		    'راست به تنهایی': 'block_right',
		    'وسط': 'block_center',
		    'داخل متن': 'inline_none',
		    'چپ به تنهایی': 'block_left',
		    'چپ': 'inline_left'
		},
		initialize: function(){
		    this.$('select').inspic('iconSelect', this.field);
		}
	    })
	)(
	    '<br>'
	)( 
	    new InputField('margin.base', 'text', {
		text: 'فاصله از متن:',
		visibilityCriteria: '!`margin.adv`'
	    })
	)(
	    new InputField('margin.top', 'text', {
		text: 'بالا',
		icon: 'mt.png',
		visibilityCriteria: 'margin.adv'
	    })
	)(
	    new InputField('margin.right', 'text', {
		text: 'راست',
		icon: 'mr.png',
		visibilityCriteria: 'margin.adv'
	    })
	)(
	    new InputField('margin.bottom', 'text', {
		text: 'پایین',
		icon: 'mb.png',
		visibilityCriteria: 'margin.adv'
	    })
	)(
	    new InputField('margin.left', 'text', {
		text: 'چپ',
		icon: 'ml.png',
		visibilityCriteria: 'margin.adv'
	    })
	);

	var $margin=$('#insertPicture .preview .pic_margin');
	$(document).on('focus mouseenter', '[field*="margin"] *', function() {
	    $margin.css('backgroundColor', '#fbfd98');
	}).on('blur mouseout', '[field*="margin"] *', function() {
	    $margin.css('backgroundColor', '#fff');
	});

    }
    
/**********************************************************************************/


    function addBorderElements(){

	/*new InputField('border.adv', 'checkbox', {
	    text: 'پیشرفته',
	    initialize: function(){
		this.$el.css('float','left');
	    }
	}).$el.appendTo('#inspic_border>legend');*/

	var inner=shadowFields('سایه داخلی:','innerShadow.', 'border.adv','x,y,alpha'.split(','));
	var borderline=borderFields('borderline.', 'border.adv', ['width']);
	var outer=shadowFields('سایه خارجی:','outerShadow.', 'border.adv', 'x,y,alpha'.split(','));

	appendTo('#inspic_border')(
	    inner.enable
	)(
	    inner.color
	)(
	    inner.blur
	)(
	    inner.x
	)(
	    inner.y
	)(
	    inner.alpha
	)(
	    '<br>'
	)(
	    borderline.enable
	)(
	    borderline.style
	)(
	    borderline.color
	)(
	    new InputField('border.padding.raw', 'text', {
		text: 'فاصله کادر بیرونی با تصویر',
		icon: 'padding.png',
		visibilityCriteria: '`outerShadow.enable` || `borderline.style`'
	    })
	)(
	    new InputField('border.background', 'text', {
		//		    text: 'رنگ بین کادر و تصویر',
		//		    icon: 'paint-can-left.png',
		initialize: function(){
		    this.$('input').colorPicker();
		    this.$('.colorPicker-picker').addClass('picker-arrow-paint');
		},
		visibilityCriteria: '`border.adv` && (`outerShadow.enable` || `borderline.style`)'
	    })
	)(
	    borderline.width
	)(
	    new InputField('border.radius', 'text', {
		text: 'شعاع انحنای لبه ها',
		icon: 'radius.resized.png',
		visibilityCriteria: 'border.adv'
		
	    })
	)(
	    '<br>'
	)(
	    outer.enable
	)(
	    outer.color
	)(
	    outer.blur
	)(
	    outer.x
	)(
	    outer.y
	)(
	    outer.alpha
	);
	
    }
    
/*********************************************************************************/

    function textFormattingFields(prefix, advField, advs){
	var vis='`'+prefix+'enable`';
	var visAdv=vis+' && `'+advField+'`';
	function crit(field){
	    //return (_.include(advs, field) ? visAdv : vis);
	    return visAdv;
	}

	return {
	    bold: new InputField(prefix+'bold', 'checkbox', {
		visibilityCriteria: crit('bold'),
		text: 'bold'
	    }),
	    italic: new InputField(prefix+'italic', 'checkbox', {
		visibilityCriteria: crit('italic'),
		text: 'italic'
	    }),
	    colorInner: new InputField(prefix+'color.inner', 'text', {
		visibilityCriteria: crit('color')+' && `caption.inner.enable`',
		initialize: function(){
		    this.$('input').colorPicker();
		    this.$('.colorPicker-picker').addClass('picker-arrow-text');
		}
	    }),
	    colorOuter: new InputField(prefix+'color.outer', 'text', {
		visibilityCriteria: crit('color')+' && `caption.outer.enable`',
		initialize: function(){
		    this.$('input').colorPicker();
		    this.$('.colorPicker-picker').addClass('picker-arrow-text');
		}
	    }),
	    size: new InputField(prefix+'size', 'text', {
		visibilityCriteria: crit('size'),
		text: 'اندازه فونت',
		icon: 'fontsize.gif'
	    })
	};
    }

    function borderFields(prefix, advField, advs){
	var vis='`'+prefix+'enable`';
	var visAdv=vis+' && `'+advField+'`';
	function crit(field){
	    return (_.include(advs, field) ? visAdv : vis);
	}
	return {
	    enable: new InputField(prefix+'enable', 'checkbox', {
		text: 'خط'
	    }),
	    style: new InputField(prefix+'style', 'select', {
		visibilityCriteria: crit('style'),
		//		text: 'نوع خط',
		options: {
		//    'بدون خط':'',
		    'خط ساده':'solid',
		    'خط چین':'dashed',
		    'نقطه چین':'dotted',
		    'دو خطی':'double'
		},
		initialize: function(){
		    this.$('select').inspic('iconSelect',this.field);
		}
	    }),
	    width: new InputField(prefix+'width', 'text', {
		visibilityCriteria: crit('width'),
		text: 'ضخامت خط',
		icon: 'border-weight.png'
	    }),
	    color: new InputField(prefix+'color', 'text', {
		visibilityCriteria: crit('color'),
		//		text: 'زنگ خط',
		//		icon: 'line.gif',
		initialize: function(){
		    this.$('input').colorPicker();
		    this.$('.colorPicker-picker').addClass('picker-arrow-line');
		}
	    })
	};
    }

    function shadowFields(text, prefix, advField, advs){
	var vis=prefix+'enable';
	var visAdv='`'+vis+'` && `'+advField+'`';
	function crit(field){
	    return (_.include(advs, field) ? visAdv : vis);
	}
	return {
	    alpha: new InputField(prefix+'alpha', 'text', {
		visibilityCriteria: crit('alpha'),
		text: 'شفافیت',
		icon: 'transparency.png',
		spinnerArgs:{ step: 0.1, min: 0, max: 1 }
	    }),
	    y: new InputField(prefix+'y', 'text', {
		visibilityCriteria: crit('y'),
		text: 'فاصله عمودی سایه با تصویر',
		icon: 'dist-v.png',
		spinnerArgs:{ min:-50 }
	    }),
	    x: new InputField(prefix+'x', 'text', {
		visibilityCriteria: crit('x'),
		text: 'فاصله افقی سایه با تصویر',
		icon: 'dist-h.png',
		spinnerArgs:{ min:-50 }
	    }),
	    blur: new InputField(prefix+'blur', 'text', {
		visibilityCriteria: crit('blur'),
		text: 'بزرگی سایه',
		icon: 'shadow-radius.png'
	    }), 
	    color: new InputField(prefix+'color', 'text', {
		visibilityCriteria: crit('color'),
		initialize: function(){
		    this.$('input').colorPicker();
		    this.$('.colorPicker-picker').addClass('picker-arrow-line');
		}
	    }),
	    enable: new InputField(prefix+'enable', 'checkbox',{
		'text': text
	    })
	};
    }

/********************************************************************************/

    function addCaptionElements(){
	
	var outerBorder=borderFields('caption.outer.border.','caption.adv',[]);
	var h1Format=textFormattingFields('caption.h1.', 'caption.adv', []);
	var pFormat=textFormattingFields('caption.p.', 'caption.adv', []);

/*	appendTo('#inspic_caption legend')(
	    new InputField('caption.adv', 'checkbox', {
		text: 'پیشرفته',
		initialize: function(){
		    this.$el.css('float','left');
		}
	    })
	);*/

	appendTo('#inspic_caption')(
	    new InputField('caption.enable', 'checkbox', {
		text: 'فعال'
	    })
	)(
	    new InputField('caption.pos', 'select', {
		//		text: 'نوع:',
		visibilityCriteria: 'caption.enable',
		options: {
		    'خارج پایین': 'outer_top',
		    'داخل بالا':'inner_top',
		    'داخل پایین':'inner_bottom',
		    'خارج بالا': 'outer_bottom'
		},
		initialize: function(){
		    this.$('select').inspic('iconSelect', this.field);
		}
	    })
	)(
	    new InputField('caption.inner.hpos', 'select', {
		//	text: 'افقی',
		options: {
		    'راست': 'right',
		    'کامل': 'full',
		    'چپ': 'left'
		},
		visibilityCriteria:'caption.inner.enable',
		initialize: function(){
		    this.$('select').inspic('iconSelect', this.field);
		    var _el=this.$('.iconSelect');
		    this.model.subscribe('caption.vpos', function(vpos){
			_el.removeClass("posTop posBottom");
			_el.addClass(vpos=='top' ? 'posTop' : 'posBottom');
		    })();
		}
	    })
	)(
	    new InputField('caption.textAlign', 'select', {
		//text: 'چینش متن:',
		visibilityCriteria: 'caption.enable',
		options: {
		    'راست':'right',
		    'وسط':'center',
		    'چپ':'left'
		},
		initialize: function(){
		    this.$('select').inspic('iconSelect',this.field);
		}
	    })
	)(
	    new InputField('caption.inner.background.color','text', {
		visibilityCriteria:'caption.inner.enable',
		//		icon: 'paint-can-left.png',
		//		text:'رنگ داخل:',
		initialize: function(){
		    this.$('input').colorPicker();
		    this.$('.colorPicker-picker').addClass('picker-arrow-paint');
		}
	    })
	)(
	    new InputField('caption.inner.background.alpha', 'text', {
		visibilityCriteria:'caption.inner.enable',
		text: 'شفافیت رنگ داخل',
		icon: 'transparency.png',
		spinnerArgs:{ step: 0.1, min: 0, max: 1 }
	    })
	)(
	    '<br>'
	)(
	    new InputField('caption.h1.type', 'select', {
		text: 'عنوان زیرنویس:',
		visibilityCriteria: 'caption.enable',
		options: {
		    'بدون عنوان': '',
		    'عنوان تصویر':'title',
		    'متن':'text'
		},
		initialize: function(){
		    var $title=this.$('option[value="title"]');
		    this.model.subscribe('title', function(val){
			$title[val ? 'show' : 'hide']();
		    })();
		}
	    })
	)(
	    new InputField('caption.h1.text', 'text', {
		visibilityCriteria:'`caption.h1.type`=="text"',
		width: 'long',
		textAlign: 'right'
	    })
	)(
	    h1Format.colorInner
	)(
	    h1Format.colorOuter
	)(
	    h1Format.size
	)(
	    h1Format.bold
	)(
	    h1Format.italic
	)(
	    '<br>'
	)(
	    new InputField('caption.p.enable', 'checkbox', {
		text: 'شرح:',
		visibilityCriteria: 'caption.enable'
	    })
	)(
	    new InputField('caption.p.text', 'text', {
		visibilityCriteria:'caption.p.enable',
		width:'long',
		textAlign: 'right'
	    })
	)(
	    pFormat.colorInner
	)(
	    pFormat.colorOuter
	)(
	    pFormat.size
	)(
	    pFormat.bold
	)(
	    pFormat.italic
	)(
	    '<br>'
	)(
	    appendTo((function(){
		var ret=$('<span>');
		inspic.model.mainModel.subscribe('caption.outer.enable', function(val){
		    ret.css('display',val ? 'inline-block' : 'none');
		})();
		return ret;
	    })())(
		outerBorder.enable
	    )(
		outerBorder.style
	    )(
		outerBorder.color
	    )(
		outerBorder.width
	    )(
		new InputField('caption.outer.padding', 'text', {
		    visibilityCriteria:'caption.outer.border.enable',
		    text:'فاصله تا کادر بیرونی',
		    icon:'padding.png'
		})
	    )(
		new InputField('caption.outer.radius', 'text', {
		    visibilityCriteria: 'caption.outer.border.enable',
		    text:'شعاع انحنای لبه کادر بیرونی',
		    icon:'radius.resized.png'
		})
	    )(
		new InputField('caption.outer.background.color','text', {
		    visibilityCriteria:'caption.outer.enable',
		    //		    text:'رنگ داخل:',
		    //		    icon: 'paint-can-left.png',
		    initialize: function(){
			this.$('input').colorPicker();
			this.$('.colorPicker-picker').addClass('picker-arrow-paint');
		    }
		})
	    )(
		new InputField('caption.outer.background.alpha', 'text', {
		    visibilityCriteria:'caption.outer.enable',
		    text: 'شفافیت رنگ داخل',
		    icon: 'transparency.png',
		    spinnerArgs:{ step: 0.1, min: 0, max: 1 }
		})
	    ).container
	);
    }

    function tabularize(){
	var $tabs=$('#insertPicture .tabs>div').inspic('tabularize', '.tab_headers');
	var $headers=$('#insertPicture .tab_headers>span[for]');
	mainModel.subscribe('src', function(val){
	    $headers.inspic('disabled', !val).first().inspic('disabled', false);
	});
	new InputField('adv', 'checkbox', {
	    text: 'نمایش تنظیمات پیشرفته'
	}).$el.appendTo('.tab_headers');
	
    }

    $(function() {
	addSrcElements();
	addPositionElements();
	addBorderElements();
	addCaptionElements();
	tabularize();
	inspic.controller.setField('src', 'img.jpg');
    });
    
})(jQuery);