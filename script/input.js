(function($) {
    
    function setHtml(html) {
	try{
	    var set={};
	    var $html = $('<html>').html(html);

	    var data=$html.find('[data-inspic]').attr('data-inspic');
	    if (data){
		var dict={};
		_.each(data.split(','), function(s){
		    var arr=s.split('|');
		    if (arr.length<2)
			return;
		    dict[arr[0]]= (arr.length==2 ? arr[1] : arr.splice(1));
		});
		data=dict;
	    } else
		data={};

	    function setPrefixArray(array, prefix, fields){
		fields=_.map(fields, function(field){
		    return prefix+field;
		});
		fields=_.object(fields, array);
		_.extend(set, fields);
	    }
	    
	    
	    set['href.url']= $html.find('[href]').attr('href') || '';
            var tmp=data['hrf'];
            set['href.type']=( tmp ?
                               ({
                                   n:'none',
                                   s:'src',
                                   d:'download',
                                   i:'info',
                                   u:'url'
                               })[tmp] : 'none');

	    if (data['etc'])
		setPrefixArray(data['etc'], '', ['position', 'adv']);
            var tmp=set['position'];
            if (tmp){
                var shorts={
                    b:'block',
                    i:'inline',
                    c:'center',
                    l:'left',
                    r:'right',
                    n:'none'
                };
                set['position']=shorts[tmp.charAt(0)]+'_'+shorts[tmp.charAt(1)];
            }

	    if (data['mrg'])
		setPrefixArray(data['mrg'], 'margin.', ['base','top', 'right', 'bottom', 'left']);

	    function shadowFields(dataField, prefix){
		var arr=data[dataField];
		if (set[prefix+'enable']=_.isArray(arr))
		    setPrefixArray(arr,prefix, ['blur', 'x', 'y', 'color', 'alpha','inset']);
	    }
	    shadowFields('ish', 'innerShadow.');
	    shadowFields('osh', 'outerShadow.');

	    var borderFields=['color','style','width'];
	    var arr=data['bdr'];
	    if (_.isArray(arr)){
		setPrefixArray(arr, 'border.', ['padding.raw', 'radius', 'background']);
		if (set['borderline.enable']=(arr.length>3))
		    setPrefixArray(arr.splice(3), 'borderline.', borderFields);
	    }

	    var arr=data['cap'];
	    if (arr){
		set['caption.enable']=true;
		setPrefixArray(arr, 'caption.', ['pos', 'textAlign', type+'.background.color', type+'.background.alpha']);
                set['caption.pos']={
                    it:'inner_top',
                    ot:'outer_top',
                    ib:'inner_bottom',
                    ob:'outer_bottom'
                }[set['caption.pos']];
		var type=set['caption.pos'].replace(/_.*^/,'');
                set['caption.textAlign']=({
                    r:'right',
                    l:'left',
                    c:'center'
                })[set['caption.textAlign']];
		arr=arr.splice(4);
		if (type=='inner'){
		    setPrefixArray(arr, 'caption.inner.', ['hpos']);
                    set['caption.inner.hpos']=({
                        r:'right',
                        f:'full',
                        l:'left'
                    })[set['caption.inner.hpos']];
		}else{
		    setPrefixArray(arr, 'caption.outer.', ['padding', 'radius']);
		    if (arr.length>2){
			set['caption.outer.border.enable']=true;
			setPrefixArray(arr.splice(2), 'caption.outer.border.', borderFields);
		    } else
			set['caption.outer.border.enable']=false;
		}

		var formatFields=['type', 'bold', 'italic', 'color.'+type, 'size'];
		arr=data['h1'];
		if (set['caption.h1.enable']=_.isArray(arr)){
		    setPrefixArray(arr, 'caption.h1.', formatFields);
		    set['caption.h1.text']=$html.find('h1').text() || '';
		}

		arr=data['p'];
		if (set['caption.p.enable']=_.isArray(arr)){
		    setPrefixArray(arr, 'caption.p.', formatFields);
		    set['caption.p.text']=$html.find('p').text() || '';
		}
	    } else
		set['capion.enable']=false;

            var $img= $html.find('img[src]').first();
	    if ($img.length){
		set['src']=$img.attr('src');
		set['title']=($img.attr('alt') || $img.attr('title') || '');
                var imgWidth=$img.width();
                var imgHeight=$img.height();
                var model=inspic.model.mainModel;
                if (imgWidth || imgHeight){
                    model.set('keep_ratio', !(imgWidth && imgHeight));
                    imgWidth && model.set('width', imgWidth);
                    imgHeight && model.set('height', imgHeight);
                }
            }
	    inspic.model.mainModel.set(inspic.model.mainModel.defaults);
	    inspic.controller.setFields(set);
	} catch(ex) {
	    console.log('Exception',ex);
	    
	}
    }

    inspic.setHtml = setHtml;

    function loadCookie(){
	var data=$.cookie('inspicData');
	if (data)
	setHtml('<img data-inspic="'+data+'">');
    }
    inspic.loadCookie=loadCookie;
})(jQuery); 
