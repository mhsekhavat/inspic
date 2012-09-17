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
	    model.on('change:' + field, this.updateValue, this);

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
	    this.$el.attr('field',this.field);

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

    var MonitorPreview = Backbone.View.extend({
	initialize : function() {
	    var model = this.model = mainModel;
	    var img = this.$('img.inspic_img');
	    var loading = this.$('img.inspic_loading');

	    model.on('change:src', function() {
		var src = model.get('src');
		var el = $('<img>').attr('src', src);
		img.replaceWith(el);
		img = el;// update img variable
		updateDimensions();
	    }, this);

	    function updateDimensions() {
		var width = model.get('width');
		var height = model.get('height');
		_.isUndefined(width) || (img.css('width', _.isNumber(width) ? width / 5 + 'px' : 'auto'));
		_.isUndefined(height) || (img.css('height', _.isNumber(height) ? height / 5 + 'px' : 'auto'));
	    }
	    model.on('change:width change:height', updateDimensions, this);

	    model.on('change:isLoading', function() {
		var isLoading = model.get('isLoading');
		if (isLoading) {
		    img.hide();
		    loading.show();
		} else {
		    img.show();
		    loading.hide();
		}
	    });
	}
    });

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
	new MonitorPreview({
	    el : $('#inspic_monitor .inspic_screen')
	});

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
	    new InputField('src.bayan.size', 'select', {
		text : 'اندازه:',
		options : {
		    'کوچک' : 'thumb',
		    'متوسط' : 'image_preview',
		    'کامل' : 'view'
		},
		visibilityCriteria : '`src.bayan`'
	    })
	)(
	    '<br>'
	)(
	    function(){
		var scroller=inspic.scroller(function(val){
		    inspic.controller.setField('width', val*1000);
		});
		mainModel.subscribe('width', function(width){
		    scroller.setScrollerValue(width/1000);
		})();
		return scroller;
	    }()
	)(
	    new InputField('width', 'text', {
		text: 'پهنا:'
	    })
	)(
	    new InputField('height', 'text', {
		text: 'ارتفاع:'
	    })
	)(
	    new InputField('keep_ratio', 'checkbox',{
		text: 'حفظ تناسب ابعاد'
	    })
	)(
	    '<br>'
	)(
	    new InputField('href.type', 'select', {
		text: 'پیوند:',
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
	    '<br>'
	)(
	    new InputField('title', 'text', {
		text: 'عنوان:',
		width: 'long',
		textAlign: 'right'
	    })
	); 
    }

    var PositionPreview = Backbone.View.extend({
	initialize: function(){
	    var model=this.model=mainModel;
	    var $clearfix=this.$('.inspic_clearfix');
	    var $margin=this.$('.pic_margin');
	    var $wrapper=this.$('.pic_wrapper');
	    var $img=this.$('img');
	    model.subscribe('position.clearfix', function(val){
		$clearfix[val ? 'addClass' : 'removeClass']('pic_clearfix');
	    })();
	    model.subscribe('position.float', function(val){
		$margin.css('float', val);
	    })();
	    model.subscribe('position.textAlign', function(val){
		$clearfix.css('text-align', val);
	    })();
	    model.subscribe('margin', function(val){
		$wrapper.css('margin', val);
	    })();
	    model.subscribe('outerShadow', function(val){
		$img.css('box-shadow', val);
	    })();
	}
    });

    function addPositionElements(){
	new PositionPreview({
	    el: $('#inspic_position')
	});

	appendTo('#inspic_position>legend')(
	    new InputField('margin.adv', 'checkbox', {
		text: 'پیشرفته',
		initialize: function(){
		    this.$el.css('float','left');
		}
	    })
	);

	appendTo('#inspic_position')(
	    new InputField('position', 'select', {
		//		text: 'چینش:',
		options:{
		    'راست': 'inline_right',
		    'راست به تنهایی': 'block_right',
		    'وسط': 'block_center',
		    'داخل متن': 'inline_none',
		    'چپ به تنهایی': 'block_left',
		    'چپ': 'inline_left',
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
		visibilityCriteria: '!`margin.adv`',
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
		visibilityCriteria: 'margin.adv',
	    })
	);

	var $margin=$('#inspic_position .pic_margin');
	$(document).on('focus mouseenter', '[field*="margin"] input[type="text"]', function() {
	    $margin.css('backgroundColor', '#fbfd98');
	}).on('blur mouseout', '[field*="margin"] input[type="text"]', function() {
	    $margin.css('backgroundColor', '#fff');
	});

    }
    
    var BorderPreview=Backbone.View.extend({
	initialize: function(){
	    var model=this.model=inspic.model.mainModel;
	    var $wrapper=this.$('.pic_wrapper');
	    var $border=this.$('.pic_border');
	    var $inner=this.$('.pic_inner');
	    var $img=this.$('img');
	    var p=inspic.pixelize;
	    model.subscribe('innerShadow', function(val){
		$inner.css('box-shadow', val);
	    })();
	    model.subscribe('borderline', function(val){
		$border.css('border', val);
	    })();
	    model.subscribe('outerShadow', function(val){
		$border.css('box-shadow', val);
	    })();
	    model.subscribe('border.padding', function(val){
		$border.css('padding', p(val));
	    })();
	    model.subscribe('border.background', function(val){
		$border.css('background-color', val);
	    })();
	    /*model.subscribe('margin', function(val){
		$wrapper.css('margin', val);
	    })();*/
	    model.subscribe('border.radius', function(val){
		$border.css('border-radius', p(val));
	    })();
	    model.subscribe('border.radius.inner', function(val){
		$inner.css('border-radius', p(val));
		$img.css('border-radius', p(val));
	    })();
	}
    });

    function addBorderElements(){
	new BorderPreview({
	    el: '#inspic_border .inspic_preview'
	});

	new InputField('border.adv', 'checkbox', {
	    text: 'پیشرفته',
	    initialize: function(){
		this.$el.css('float','left');
	    }
	}).$el.appendTo('#inspic_border>legend');

	var inner=shadowFields('سایه داخلی:','innerShadow.', 'border.adv','x,y,alpha'.split(','));
	var borderline=borderFields('borderline.', 'border.adv', ['width']);
	var outer=shadowFields('سایه خارجی:','outerShadow.', 'border.adv', 'x,y,alpha'.split(','));

	appendTo('#inspic_border')(
	    appendTo($('<fieldset>'))(
		appendTo($('<legend>'))(
		    inner.enable
		).container
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
	    ).container
	)(
	    appendTo($('<fieldset>'))(
		appendTo($('<legend>'))(
		    borderline.enable
		).container
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
	    ).container
	)(
	    appendTo($('<fieldset>'))(
		appendTo($('<legend>'))(
		    outer.enable
		).container
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
	    ).container
	);
	
    }
    
    function textFormattingFields(prefix, advField, advs){
	var vis='`'+prefix+'enable`';
	var visAdv=vis+' && `'+advField+'`';
	return {
	    bold: new InputField(prefix+'bold', 'checkbox', {
		visibilityCriteria: visAdv,
		text: 'bold'
	    }),
	    italic: new InputField(prefix+'italic', 'checkbox', {
		visibilityCriteria: visAdv,
		text: 'italic'
	    }),
	    colorInner: new InputField(prefix+'color.inner', 'text', {
		visibilityCriteria: visAdv+' && `caption.inner.enable`',
		initialize: function(){
		    this.$('input').colorPicker();
		    this.$('.colorPicker-picker').addClass('picker-arrow-text');
		}
	    }),
	    colorOuter: new InputField(prefix+'color.outer', 'text', {
		visibilityCriteria: visAdv+' && `caption.outer.enable`',
		initialize: function(){
		    this.$('input').colorPicker();
		    this.$('.colorPicker-picker').addClass('picker-arrow-text');
		}
	    }),
	    size: new InputField(prefix+'size', 'text', {
		visibilityCriteria: visAdv,
		text: 'اندازه فونت',
		icon: 'fontsize.gif'
	    })
	}
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
		icon: 'dist-v.png'
	    }),
	    x: new InputField(prefix+'x', 'text', {
		visibilityCriteria: crit('x'),
		text: 'فاصله افقی سایه با تصویر',
		icon: 'dist-h.png'
	    }),
	    blur: new InputField(prefix+'blur', 'text', {
		visibilityCriteria: crit('blur'),
		text: 'بزرگی سایه',
		icon: 'shadow-radius.png',
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

    var InnerCaptionPreview=Backbone.View.extend({
	initialize: function(){
	    var model=this.model=inspic.model.mainModel;
	    var $el=this.$el;
	    model.subscribe('caption.inner.enable', function(val){
		$el[val ? 'show' : 'hide']();
	    })();
	    model.subscribe('caption.textAlign', function(val){
		$el.css('text-align', val);
	    })();
	    model.subscribe('caption', function(content){
		$el.html(content.trim() || '{زیرنویس}');
	    })();
	    model.subscribe('caption.vpos', function(val){
		$el.css({
		    top: (val=='top' ? '0' : 'auto'),
		    bottom: (val=='bottom' ? '0' : 'auto')
		});
	    })();
	    model.subscribe('caption.inner.hpos', function(val){
		$el.css({
		    left : (val == 'left' || val == 'full') ? '0' : 'auto',
		    right : (val == 'right' || val == 'full') ? '0' : 'auto'
		});
	    })();
	    model.subscribe('caption.inner.background', function(val){
		$el.css('background-color', val);
	    })();
	    model.subscribe('caption.inner.radius', function(val){
		$el.css('border-radius', val);
	    })();
	}
    });

    var OuterCaptionPreview=Backbone.View.extend({
	initialize: function(){
	    var model=this.model=inspic.model.mainModel;
	    var $el=this.$el;
	    var $wrapper=$el.closest('.pic_wrapper');
	    var p=inspic.pixelize;
	    model.subscribe('caption.outer.enable', function(val){
		$el.css('display', (val ? 'block' : 'none'));
		//$el[val=='outer' ? 'show': 'hide']();
	    })();
	    model.subscribe('caption.textAlign', function(val){
		$el.css('text-align', val);
	    })();
	    model.subscribe('caption', function(content){
		$el.html(content.trim() || '{زیرنویس}');
	    })();
	    model.subscribe('`caption.outer.enable` && `caption.outer.border`', function(val){
		$wrapper.css('border', inspicEval(val) || '');
	    })();
	    model.subscribe('`caption.outer.enable` && `caption.outer.background`', function(val){
		$wrapper.css('background-color', inspicEval(val) || '');
	    })();
	    model.subscribe('`caption.outer.enable` && `caption.outer.padding`', function(val){
		$wrapper.css('padding', p(inspicEval(val) || 0));
	    })();
	    model.subscribe('`caption.outer.enable` && `caption.outer.radius`', function(val){
		$wrapper.css('border-radius', p(inspicEval(val || 0)) );
	    })();
	    model.subscribe('caption.vpos', function(val){
		$el[(val=='top' ? 'prependTo' : 'appendTo')]($wrapper);
	    })();

	}
    });


    function addCaptionElements(){
	new InnerCaptionPreview({
	    el: $('#inspic_border .pic_caption_inner')
	});
	new OuterCaptionPreview({
	    el: $('#inspic_border .pic_caption_outer')
	});
	
	var outerBorder=borderFields('caption.outer.border.','caption.adv',[]);
	var h1Format=textFormattingFields('caption.h1.', 'caption.adv', []);
	var pFormat=textFormattingFields('caption.p.', 'caption.adv', []);

	appendTo('#inspic_caption legend')(
	    new InputField('caption.enable', 'checkbox', {
		text: 'زیر نویس'
	    })
	)(
	    new InputField('caption.adv', 'checkbox', {
		text: 'پیشرفته',
		initialize: function(){
		    this.$el.css('float','left');
		}
	    })
	);

	appendTo('#inspic_caption')(
	    new InputField('caption.pos', 'select', {
		//		text: 'نوع:',
		options: {
		    'خارج پایین': 'outer_top',
		    'داخل بالا':'inner_top',
		    'داخل پایین':'inner_bottom',
		    'خارج بالا': 'outer_bottom',
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
		options: {
		    'بدون عنوان': '',
		    'عنوان تصویر':'title',
		    'متن':'text'
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

    $(function() {
	addSrcElements();
	addPositionElements();
	addBorderElements();
	addCaptionElements();
	var output;
	$('<a href="#">output</a>').prependTo('body').click(function(){
	    if (!output)
		output=new inspic.view.Output({
		    'model':mainModel
		});
	    else{
		output.render();
		output.el.focus();
	    }
	    return false;
	});
	inspic.controller.setField('src', 'img.jpg');
    });
    
})(jQuery);