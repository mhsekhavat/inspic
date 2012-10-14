(function($) {
    inspic.view = {};
    var mainModel = inspic.model.mainModel;

    // load templates for later use from index.html
    var templates = {};
    $('[inspic_tem]').each(function() {
        var $this = $(this);
        templates[$this.attr('inspic_tem')] = _.template($this.html());
    });

    var InputField = Backbone.View.extend({
        tagName : 'span', // tag name of html [container] element
        className : 'inspic_inputfield', // class name of html [container] element
        inputSelector : 'input', // selects html elements whose value should be set to model
        template : 'text', // default underscore template name

        updateValue : function(val) {
            this.$inputSelector.inspic('val', val);
            this.$inputSelector.trigger('change', ['inspicView']);
        },

        updateDisability : function() {
            this.$('*').inspic('disabled', this.model.get('isLoading'));
        },

        initialize : function(field, args) {
            args || ( args = {});
            var model = this.model = mainModel;
            this.field = field;
            
            !args.events || (this.events = args.events);

            this.render(field, args);

            this.inputSelector && (this.$inputSelector = this.$(this.inputSelector));

            field && model.subscribe(field, this.updateValue, this)();

            var criteria = args.visCrit;
            if (criteria) {
                var $el = this.$el;
                model.subscribe(criteria,function(substituted) {
                    $el.css('display',
                            inspicEval(substituted) ? 'inline-block': 'none');
                })();
            }

            !args.subscribe || _.each(args.subscribe, function(val, key) {
                model.subscribe(key, val, this)();
            }, this);

            !args.initialize || (args.initialize.call(this, model));
        },

        events : {
            "change input" : "onChange",
        },

        // generate variables that will be passed to underscore template
        generateRenderVariables : function(args) {
            var data = _.pick(args, 'text', 'icon', 'options');
            var variables = {
                id : _.uniqueId('inspic_'),
                'data' : data
            };
            variables.label = templates['label'](variables);
            return variables;
        },

        render : function(field, args) {
            var variables = this.generateRenderVariables(args);
            this.$el.html(templates[this.template](variables));
            this.$el.attr({
                'field' : this.field,
                'title' : (args.text || '').replace(/:$/, '')
            });
        },

        onChange : function(e, inspicView) {
            if (inspicView == 'inspicView')
                return;
            inspic.controller.handleDefaultInputFieldChange(this.field, $(e.target).inspic('val'), this, e);
        }
    });
    inspic.view.InputField = InputField;

    var TextInputField = InputField.extend({
        template : 'text',
        render : function(field, args) {
            InputField.prototype.render.call(this, field, args);

            var width = args.width || 50;
            (width == 'long') && ( width = 250);

            this.$('input').css({
                'width' : width + 'px',
                'text-align' : args.textAlign || 'center',
                'direction' : (args.textAlign == 'right' ? 'rtl' : 'ltr')
            });

            // fields whose default value is number will have spinner
            if (( typeof (this.model.defaults[field])).toLowerCase() == "number" && !args.noSpinner)
                this.$el.find('input').inspic('spinner', args.spinnerArgs);
        },

        events : {
            "change input" : "onChange",
            "keyup input" : "onChange"
        }
    });

    var SelectInputField = InputField.extend({
        inputSelector : 'select',
        template : 'select',
        events : {
            'change select' : 'onChange'
        }
    });

    var IconSelectInputField = SelectInputField.extend({
        render : function(field, args) {
            SelectInputField.prototype.render.call(this, field, args);
            this.$('select').inspic('iconSelect', this.field);
        }
    });

    var CheckInputField = InputField.extend({
        template : 'checkbox'
    });

    var ColorInputField = InputField.extend({
        render : function(field, args) {
            InputField.prototype.render.call(this, field, args);
            this.$('input').colorPicker();
            args.colorPickerClass && this.$('.colorPicker-picker').addClass(args.colorPickerClass);
        }
    });

    /* *************************************************************************************************************
     * */

    function appendTo(container, elements){
        _.each(elements, function(element){
            if (!element)
                return;
            !(element.el) || ( element = element.el);
            $(element).appendTo(container);
        });
        return container;
    }
    
    function addSrcElements() {
        appendTo('#inspic_src',[
            new TextInputField('src', {
                text : 'آدرس:',
                width : 'long',
                textAlign : 'left',
                events : {
                    "change input" : "onChange"
                }
            }),
            new TextInputField('title', {
                text : 'عنوان:',
                width : 'long',
                textAlign : 'right',
                visCrit : '`src`'
            }),
            '<br>',
            new SelectInputField('src.bayan.size', {
                text : 'اندازه:',
                options : {
                    'کوچک' : 'thumb',
                    'متوسط' : 'image_preview',
                    'کامل' : 'view'
                },
                visCrit : '`src.bayan` && `src`'
            }),
            function() {
                var slider=$('<input>', {
                    type:'range',
                    min: '0',
                    max: '10',
                    progress: 'true'
                });
                $(function(){
                    slider.rangeinput();
                });
                return slider;
            }()
/*            function() {
                var wrapper = $('<span>');
                var scroller = inspic.scroller(function(val) {
                    inspic.controller.setField('scale', val * 100);
                });
                mainModel.subscribe('scale', function(scale) {
                    scroller.setScrollerValue(Math.max(Math.min(scale/100, 1), 0));
                })();
                mainModel.subscribe('src', function(val) {
                    wrapper.css('display', (val ? 'inline-block' : 'none'));
                })();

                wrapper.text('مقیاس: ');
                wrapper.addClass('inspic_inputfield');
                wrapper.append(scroller);
                return wrapper;
            })() */,
            new TextInputField('width', {
                visCrit : '`src.adv` && `src`',
                text : 'پهنا:'
            }),
            new TextInputField('height', {
                visCrit : '`src.adv` && `src`',
                text : 'ارتفاع:'
            }),
            new CheckInputField('keep_ratio', {
                visCrit : '`src.adv` && `src`',
                text : 'حفظ تناسب ابعاد'
            })
        ]);

        appendTo('#inspic_link',[
            new SelectInputField('href.type',{
                text : 'مقصد پیوند:',
                /* Note: input.js and output.js assumes first letters of
                 * values are different when shortening data
                 */
                options : { 
                    'بدون پیوند' : 'none',
                    'نمایش تصویر' : 'src',
                    'دانلود':'download',
                    'صفحه اطلاعات بیان‌باکس':'info',
                    'url' : 'url'
                },
                subscribe : {
                    '`src.bayan`' : function(
                        substituted) {
                        this.$('option[value="download"],option[value="info"]')[inspicEval(substituted) ? 'show': 'hide']();
                    }
                }
            }),
            new TextInputField('href.url', {
                width : 'long',
                textAlign : 'left',
                subscribe : {
                    '`href.type`' : function(substituted) {
                        substituted == '"url"' ? this.$('input').css('display', 'inline-block').focus().select() : this.$('input').hide();
                    }
                }
            }),
            new TextInputField(
                'href',
                {
                    width : 'long',
                    textAlign : 'left',
                    alwaysEnabled : true,
                    visCrit : '`href.type`!="url" && `href.type`!="none"',
                    initialize : function() {
                        this.$('input')
                            .inspic('disabled', true);
                    },
                    subscribe: {
                        'href': function(val){
                            this.$('input').attr('title', val);
                        }
                    }
                }),
            new SelectInputField('href.target', {
                text : 'محل باز شدن:',
                visCrit : '`href.type`!="none" && `src.adv`',
                options : {
                    'صفحه جدید' : '_blank',
                    'صفحه فعلی' : '_self'
                }
            })
        ]);
    }

    /** ******************************************************************** */

    function addPositionElements() {

        /*
         * appendTo('#inspic_position>legend')( new InputField('margin.adv',
         * 'checkbox', { text: 'پیشرفته', initialize: function(){
         * this.$el.css('float','left'); } }) );
         */

        appendTo('#inspic_position',[
            new IconSelectInputField('position', {
                options : {
                    'راست' : 'inline_right',
                    'راست به تنهایی' : 'block_right',
                    'وسط' : 'block_center',
                    'داخل متن' : 'inline_none',
                    'چپ به تنهایی' : 'block_left',
                    'چپ' : 'inline_left'
                }
            }),
            '<br>',
            new TextInputField('margin.base', {
                text : 'فاصله از متن:',
                visCrit : '!`margin.adv`'
            }),
            new TextInputField('margin.top', {
                text : 'بالا',
                icon : 'mt',
                visCrit : 'margin.adv'
            }),
            new TextInputField('margin.right', {
                text : 'راست',
                icon : 'mr',
                visCrit : 'margin.adv'
            }),
            new TextInputField('margin.bottom', {
                text : 'پایین',
                icon : 'mb',
                visCrit : 'margin.adv'
            }),
            new TextInputField('margin.left', {
                text : 'چپ',
                icon : 'ml',
                visCrit : 'margin.adv'
            })
        ]);

        var $margin = $('#insertPicture .preview .ipic-mrg');
        $(document).on('focus mouseenter', '[field*="margin"] *', function() {
            $margin.css('backgroundColor', '#fbfd98');
        }).on('blur mouseout', '[field*="margin"] *', function() {
            $margin.css('backgroundColor', '#fff');
        });

    }

    /** *******************************************************************************
     * */

    function addBorderElements() {

        var inner = shadowFields('سایه داخلی:', 'innerShadow.', 'border.adv', 'x,y,alpha'.split(','));
        var borderline = borderFields('borderline.', 'border.adv', ['width']);
        var outer = shadowFields('سایه خارجی:', 'outerShadow.', 'border.adv', 'x,y,alpha'.split(','));

        appendTo('#inspic_border',[
            inner.enable,
            inner.color,
            inner.blur,
            inner.x,
            inner.y,
            inner.alpha,
            '<br>',
            borderline.enable,
            borderline.style,
            borderline.color,
            new TextInputField(
                'border.padding.raw',
                {
                    text : 'فاصله کادر بیرونی با تصویر',
                    icon : 'padding',
                    visCrit : '`outerShadow.enable` || `borderline.style`'
                }),
            new ColorInputField(
                'border.background',
                {
                    // text: 'رنگ بین کادر و تصویر',
                    // icon: 'paint-can-left.png',
                    colorPickerClass : 'picker-arrow-paint',
                    visCrit : '`border.adv` && (`outerShadow.enable` || `borderline.style`)'
                }),
            borderline.width,
            new TextInputField('border.radius', {
                text : 'شعاع انحنای لبه ها',
                icon : 'radius',
                visCrit : 'border.adv'
            }),
            '<br>',
            outer.enable,
            outer.color,
            outer.blur,
            outer.x,
            outer.y,
            outer.alpha
        ]);
    }

    /** ******************************************************************************
     * */

    function textFormattingFields(prefix, advField, advs) {
        var vis = '`' + prefix + 'enable`';
        var visAdv = vis + ' && `' + advField + '`';

        function crit(field) {
            // return (_.include(advs, field) ? visAdv : vis);
            return visAdv;
        }

        var BoolInputField = InputField.extend({
            tagName : 'span',
            className : 'iconSelectItem',
            template : 'bool',
            updateValue : function(val) {
                this.$el[(val ? 'addClass' : 'removeClass')]('selected');
            },
            events : {
                "click" : "onChange"
            },
            onChange : function(e, inspicView) {
                $(e.target).inspic('val', !this.model.get(this.field));
                InputField.prototype.onChange.call(this, e, inspicView);
            }
        });

        var BoolGroup = InputField.extend({
            initialize : function(fields, args) {
                this.fields = fields;
                InputField.prototype.initialize.call(this, 'testField', args);
            },
            render : function() {
                var $el = $('<span class="iconSelect">').appendTo(this.$el);
                _.each(this.fields, function(x, i) {
                    i || x.$el.addClass('first');
                    $el.append(x.$el);
                });
            }
        });

        return {
            boldItalic : new BoolGroup([new BoolInputField(prefix + 'bold', {
                text : 'bold',
                icon : 'bold'
            }), new BoolInputField(prefix + 'italic', {
                text : 'italic',
                icon : 'italic'
            })], {
                visCrit : crit('boldItalic')
            }),
            colorInner : new ColorInputField(prefix + 'color.inner', {
                visCrit : crit('color') + ' && `caption.inner.enable`',
                colorPickerClass : 'picker-arrow-text'
            }),
            colorOuter : new ColorInputField(prefix + 'color.outer', {
                visCrit : crit('color') + ' && `caption.outer.enable`',
                colorPickerClass : 'picker-arrow-text'
            }),
            size : new TextInputField(prefix + 'size', {
                visCrit : crit('size'),
                text : 'اندازه فونت',
                icon : 'fontsize'
            })
        };
    }

    function borderFields(prefix, advField, advs, enableTitle) {
        var vis = '`' + prefix + 'enable`';
        var visAdv = vis + ' && `' + advField + '`';

        function crit(field) {
            return (_.include(advs, field) ? visAdv : vis);
        }

        return {
            enable : new CheckInputField(prefix + 'enable', {
                text : enableTitle || 'خط'
            }),
            style : new IconSelectInputField(prefix + 'style', {
                visCrit : crit('style'),
                // text: 'نوع خط',
                options : {
                    // 'بدون خط':'',
                    'خط ساده' : 'solid',
                    'خط چین' : 'dashed',
                    'نقطه چین' : 'dotted',
                    'دو خطی' : 'double'
                }
            }),
            width : new TextInputField(prefix + 'width', {
                visCrit : crit('width'),
                text : 'ضخامت خط',
                icon : 'bwidth'
            }),
            color : new ColorInputField(prefix + 'color', {
                visCrit : crit('color'),
                // text: 'زنگ خط',
                // icon: 'line.gif',
                colorPickerClass : 'picker-arrow-line'
            })
        };
    }

    function shadowFields(text, prefix, advField, advs) {
        var vis = prefix + 'enable';
        var visAdv = '`' + vis + '` && `' + advField + '`';

        function crit(field) {
            return (_.include(advs, field) ? visAdv : vis);
        }

        return {
            alpha : new TextInputField(prefix + 'alpha', {
                visCrit : crit('alpha'),
                text : 'شفافیت',
                icon : 'alpha',
                spinnerArgs : {
                    step : 0.1,
                    min : 0,
                    max : 1
                }
            }),
            y : new TextInputField(prefix + 'y', {
                visCrit : crit('y'),
                text : 'فاصله عمودی سایه با تصویر',
                icon : 'sh-y',
                spinnerArgs : {
                    min : -50
                }
            }),
            x : new TextInputField(prefix + 'x', {
                visCrit : crit('x'),
                text : 'فاصله افقی سایه با تصویر',
                icon : 'sh-x',
                spinnerArgs : {
                    min : -50
                }
            }),
            blur : new TextInputField(prefix + 'blur', {
                visCrit : crit('blur'),
                text : 'بزرگی سایه',
                icon : 'sh-rad'
            }),
            color : new ColorInputField(prefix + 'color', {
                visCrit : crit('color'),
                colorPickerClass : 'picker-arrow-line'
            }),
            enable : new CheckInputField(prefix + 'enable', {
                'text' : text
            })
        };
    }

    /** *****************************************************************************
     * */

    function addCaptionElements() {

        var outerBorder = borderFields('caption.outer.border.', 'caption.adv', ['style'], 'کادر');
        var h1Format = textFormattingFields('caption.h1.', 'caption.adv', []);
        var pFormat = textFormattingFields('caption.p.', 'caption.adv', []);

        /*
         * appendTo('#inspic_caption legend')( new InputField('caption.adv',
         * 'checkbox', { text: 'پیشرفته', initialize: function(){
         * this.$el.css('float','left'); } }) );
         */

        appendTo('#inspic_caption',[
            new CheckInputField('caption.enable', {
                text : 'فعال'
            }),
            new IconSelectInputField('caption.pos', {
                // text: 'نوع:',
                visCrit : 'caption.enable',
                options : {
                    'خارج پایین' : 'outer_top',
                    'داخل بالا' : 'inner_top',
                    'داخل پایین' : 'inner_bottom',
                    'خارج بالا' : 'outer_bottom'
                }
            }),
            new IconSelectInputField('caption.inner.hpos', {
                // text: 'افقی',
                options : {
                    'راست' : 'right',
                    'کامل' : 'full',
                    'چپ' : 'left'
                },
                visCrit : 'caption.inner.enable',
                subscribe : {
                    'caption.vpos' : function(vpos) {
                        var $el = this.$('.iconSelect')
                            .removeClass("posTop posBottom");
                        $el.addClass(vpos == 'top' ? 'posTop'
                                     : 'posBottom');
                    }
                }
            }),
            new IconSelectInputField('caption.textAlign', {
                // text: 'چینش متن:',
                visCrit : 'caption.enable',
                options : {
                    'راست' : 'right',
                    'وسط' : 'center',
                    'چپ' : 'left'
                }
            }),
            new ColorInputField('caption.inner.background.color', {
                visCrit : 'caption.inner.enable',
                // icon: 'paint-can-left.png',
                // text:'رنگ داخل:',
                colorPickerClass : 'picker-arrow-paint'
            }),
            new TextInputField('caption.inner.background.alpha', {
                visCrit : 'caption.inner.enable',
                text : 'شفافیت رنگ داخل',
                icon : 'alpha',
                spinnerArgs : {
                    step : 0.1,
                    min : 0,
                    max : 1
                }
            }),
            appendTo(
                function() {
                    var ret = $('<span>');
                    inspic.model.mainModel.subscribe(
                        'caption.outer.enable',
                        function(val) {
                            ret.css('display',
                                    val ? 'inline-block'
                                    : 'none');
                        })();
                    return ret;
                }(),
                outerBorder.enable,
                outerBorder.style,
                outerBorder.color,
                outerBorder.width,
                new TextInputField('caption.outer.padding',{
                    visCrit : 'caption.outer.border.enable',
                    text : 'فاصله تا کادر بیرونی',
                    icon : 'padding'
                }),
                new TextInputField('caption.outer.radius', {
                    visCrit : 'caption.outer.border.enable',
                    text : 'شعاع انحنای لبه کادر بیرونی',
                    icon : 'radius'
                }),
                new ColorInputField('caption.outer.background.color', {
                    visCrit : 'caption.outer.border.enable',
                    // text:'رنگ داخل:',
                    // icon:
                    // 'paint-can-left.png',
                    colorPickerClass : 'picker-arrow-paint'
                }),
                new TextInputField('caption.outer.background.alpha', {
                    visCrit : '`caption.outer.border.enable` && `caption.adv`',
                    text : 'شفافیت رنگ داخل',
                    icon : 'transparency',
                    spinnerArgs : {
                        step : 0.1,
                        min : 0,
                        max : 1
                    }
                })
            ),
            '<br>',
            new SelectInputField('caption.h1.type',{
                text : 'عنوان زیرنویس:',
                visCrit : 'caption.enable',
                options : {
                    'عنوان تصویر' : 'title',
                    'متن' : 'text'
                },
                subscribe : {
                    'title' : function(val) {
                        this.$('option[value="title"]')[val ? 'show'
                                                        : 'hide']();
                    }
                }
            }),
            new TextInputField('caption.h1.text', {
                visCrit : '`caption.enable` && `caption.h1.type`=="text"',
                width : 'long',
                textAlign : 'right'
            }),
            h1Format.colorInner,
            h1Format.colorOuter,
            h1Format.size,
            h1Format.boldItalic,
            '<br>',
            new CheckInputField('caption.p.enable', {
                text : 'شرح:',
                visCrit : 'caption.enable'
            }),
            new TextInputField('caption.p.text',{
                visCrit : '`caption.p.enable` && `caption.enable`',
                width : 'long',
                textAlign : 'right'
            }),
            pFormat.colorInner,
            pFormat.colorOuter,
            pFormat.size,
            pFormat.boldItalic,
            '<br>'
        ]);
    }

    function tabularize() {
        $('#insertPicture .tabs>div').inspic('tabularize', '.tab_headers');
        var $headers = $('#insertPicture .tab_headers>span[for]');
        mainModel.subscribe('src', function(val) {
            $headers.inspic('disabled', !val).first().inspic('disabled', false);
        });
        appendTo('.tab_headers', [
            $('<span>', {
                'class' : 'inspic_button submit',
                text : 'درج',
                click : function() {
                    inspic.callback && inspic.callback(inspic.getHtml());
                    //console.log(inspic.getHtml());
                }
            }),
            $('<span>', {
                'class' : 'inspic_button cancel',
                text : 'انصراف',
                click : function() {
                    inspic.callback && inspic.callback();
                }
            }),
            new CheckInputField('adv', {
                text : 'نمایش تنظیمات پیشرفته'
            })
        ]);
        
    }

    function addElements() {
        addSrcElements();
        addPositionElements();
        addBorderElements();
        addCaptionElements();
        tabularize();
    }


    inspic.view.addElements = addElements;

})(jQuery);
