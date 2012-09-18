(function($){

    var mainModel=inspic.model.mainModel;

    var ImagePreview = Backbone.View.extend({
	initialize : function() {
	    var model = this.model = mainModel;
	    var img = this.$('img');
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
		_.isUndefined(width) || (img.css('width', _.isNumber(width) ? width + 'px' : 'auto'));
		_.isUndefined(height) || (img.css('height', _.isNumber(height) ? height + 'px' : 'auto'));
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


    var BorderPreview=Backbone.View.extend({
	initialize: function(){
	    var model=this.model=mainModel;
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

    var InnerCaptionPreview=Backbone.View.extend({
	initialize: function(){
	    var model=this.model=mainModel;
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
	    var model=this.model=mainModel;
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

    $(function(){
	new ImagePreview({
	    el : $('#insertPicture .preview')
	});
	new BorderPreview({
	    el: $('#insertPicture .preview')
	});
	new PositionPreview({
	    el: $('#insertPicture .preview')
	});
	new InnerCaptionPreview({
	    el: $('#insertPicture .pic_caption_inner')
	});
	new OuterCaptionPreview({
	    el: $('#insertPicture .pic_caption_outer')
	});
    });

})(jQuery);