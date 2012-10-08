(function($) {
    var controller=inspic.controller = {};
    var model = inspic.model.mainModel;

    function numberize(s){
        if (_.isNumber(s))
            return s;
        s=s||'';
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
        var type=typeof(model.defaults[field]);
        if (type=="number")
            value=numberize(value);
        else if (type=="boolean"){
            value=inspic.parseBool(value);
        }
        if (_.isNaN(value))
            return;
        if ((setter=modelFieldSetters[field])){
            setter.call(model,value,e);
        } else {
            set(field,value);
        } 
    }
    controller.setField=setField;
    controller.handleDefaultInputFieldChange=setField;

    function setFields(dict){
        for (var field in dict)
            setField(field, dict[field]);
    }
    controller.setFields=setFields;

    var modelFieldSetters = {
        //in all these functions, this is equal to model
        'src' : function(url) {
            var newImg = $(new Image()).hide().appendTo('body');

            function handleSuccess(){
                set('isLoading', false);
                set('src.width', newImg.width());
                set('src.height', newImg.height());
                
                var loadedH=inspic.srcLoadedHeight, loadedW=inspic.srcLoadedWidth;
                if (loadedH || loadedW)
                    set('keep_ratio', !!(loadedH && loadedW))
                var h=loadedH || newImg.height();
                var w=loadedW || newImg.width();
                
                set('height', h);
                set('width', w);
                set('src', url);
                var bayan = url.match(/^(https?:\/\/)?(www\.)?bayanbox\.ir\/[^?]*(\?(thumb|image_preview|view))?$/);
                if (bayan) {
                    set('src.bayan', true);
                    var matchedSize = bayan[4];
                    set('src.bayan.size', matchedSize || null);
                } else {
                    set('src.bayan', false);
                }
                newImg.remove();
            }
            function handleError(){
                set('isLoading', false);
                set('src', null);
                set('src.bayan', false);
                alert('آدرس تصویر معتبر نیست');
                newImg.remove();
            }
            
            newImg.load(handleSuccess).error(handleError);
            
            if (url){
                set('isLoading', true);
                newImg.attr('src', url);
            } else
                handleError();
        },

        'src.bayan.size': function(size){
            if (!get('src.bayan'))
                return;
            setField('src',inspic.bayanbox(get('src'), size));
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
        
        'adv': function(val){
            setField('margin.adv', val);
            setField('caption.adv', val);
            setField('border.adv', val);
            setField('src.adv', val);
            set('adv', val);
        },
        
        'margin.adv': function(val){
            if (val){
                var $tmp=$('<div>').css('margin',get('margin'));
                setField('margin.top', $tmp.css('marginTop'));
                setField('margin.bottom', $tmp.css('marginBottom'));
                setField('margin.right', $tmp.css('marginRight'));
                setField('margin.left', $tmp.css('marginLeft'));
            } else {
                var args=_.map(['margin.top', 'margin.right', 'margin.bottom', 'margin.left', 'position', 'margin.base', 'outerShadow.enable', 'outerShadow.blur', 'outerShadow.x', 'outerShadow.y'], function(field){
                    return this.get(field);
                }, this);
                var base=this.autoMarginInv.apply(this, args);
                set('margin.base', base);
            }
            set('margin.adv', val);
        }
        
    };
    
})(jQuery);
