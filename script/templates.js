var inspic=inspic || {};
(function($){
    var head='<script type="text/template" inspic_tem="label">\
<label for="<%=id%>">\
<% if (data.icon) {%>\
<img src="<%=data.icon%>" title="<%=data.text%>" alt="<%=data.text%>:">\
<%} else if(data.text) {%>\
<%=data.text%>\
<% } %>\
</label>\
</script>\
\
<script type="text/template" inspic_tem="text" >\
<%=label%>\
<input id="<%=id%>" type="text">\
</script>\
\
<script type="text/template" inspic_tem="select">\
<%=label%>\
<select id="<%=id%>">\
<%_.each(data.options, function(val,key){%>\
<option value="<%=val%>"><%=key%></option>\
<%})%>\
</select>\
</script>\
\
<script type="text/template" inspic_tem="checkbox">\
<input id="<%=id%>" type="checkbox">\
<%=label%>\
</script>\
\
<script type="text/template" inspic_tem="empty">\
</script>\
\
<script type="text/template" inspic_tem="bool">\
<img src="<%=data.icon%>">\
</script>\
\
<script type="text/template" id="inspic_tem_selectItem">\
<span class="iconSelect">\
<%var first=true;_.each(items, function(val,key){%><span class="iconSelectItem<%if(first){first=false;%> first<%}%>" value="<%=key%>" title="<%=val%>">&nbsp;</span><%});%>\
</span>\
</script>\
\
<script type="text/template" id="inspic_tem_spinner">\
<span class="inspic_spinner">\
&nbsp;\
<img class="inspic_up" src="images/icon/bullet_arrow_up.png">\
<img class="inspic_dn" src="images/icon/bullet_arrow_down.png">\
</span>\
</script>';

    inspic.injectTemplates=_.once(function(){
	$('head').append(head);
    });
    inspic.injectTemplates();

})(jQuery);