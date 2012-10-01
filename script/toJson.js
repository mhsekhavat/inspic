(function($) {
    function getNonDefaults (regs){
	var keys=_.intersection(_.keys(this.attributes), _.keys(this.defaults));
	if (regs)
	    keys=_.filter(keys, function(key){
		for (var reg in regs){
		    if (regs[reg].test(key))
			return true;
		}
		return false;
	    });
	return _.pick(this.attributes, keys);
    }

    function unflatten(map) {
	var ret={};
	function walk(str, node) {
	    var dot = str.indexOf('.');
	    var child = (dot>-1 ? str.substring(0,dot) : str);
	    var childNode=node[child];
	    if (_.isUndefined(childNode))
		childNode=node[child]={};
	    return (dot>-1 ? walk(str.substring(dot+1), childNode) : childNode);
	}
	
	for(var key in map){
	    var node=walk(key, ret);
	    _.extend(node, {'_':map[key]});
	}

	function compress(node){
	    if (_.isObject(node)){
		var cntKeys=0;
		for (var key in node){
		    cntKeys++;
		    if (compress(node[key]))
			node[key]=node[key]['_'];
		}
		return (cntKeys==1 && ('_' in node));
	    } 
	    return false;				
	}
	
	compress(ret);
	return ret;
    }
    inspic.model.unflatten=unflatten;
    
    function flatten(map) {
	var ret={};
	function walk(node, prefix){
	    if (_.isObject(node))
		for (var key in node){
		    var newPrefix=(prefix ? prefix+'.' : '')+key;
		    if (key=='_')
			newPrefix=prefix;
		    walk(node[key], newPrefix);
		}
	    else
		ret[prefix]=node;
	}
	walk(map);
	return ret;
    }
    inspic.model.flatten=flatten;

    function f(x){

	return JSON.stringify(unflatten(inspic.model.mainModel.getNonDefaults(x)));
    }
    ffff=f;
})(jQuery);