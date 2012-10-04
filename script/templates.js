var inspic=inspic || {};
(function($){
    var head='<script type="text/template" inspic_tem="label">'+
        '<label for="<%=id%>">'+
        '<% if (data.icon) {%>'+
        '<span class="inspic16 <%=data.icon%>" title="<%=data.text%>"></span>'+
        '<%} else if(data.text) {%>'+
        '<%=data.text%>'+
        '<% } %>'+
        '</label>'+
        '</script>'+

    '<script type="text/template" inspic_tem="text" >'+
        '<%=label%>'+
        '<input id="<%=id%>" type="text">'+
        '</script>'+

    '<script type="text/template" inspic_tem="select">'+
        '<%=label%>'+
        '<select id="<%=id%>">'+
        '<%_.each(data.options, function(val,key){%>'+
        '<option value="<%=val%>"><%=key%></option>'+
        '<%})%>'+
        '</select>'+
        '</script>'+

    '<script type="text/template" inspic_tem="checkbox">'+
        '<input id="<%=id%>" type="checkbox">'+
        '<%=label%>'+
        '</script>'+

    '<script type="text/template" inspic_tem="empty">'+
        '</script>'+

    '<script type="text/template" inspic_tem="bool">'+
        '<span class="inspic16 <%=data.icon%>"></span>'+
        '</script>'+

    '<script type="text/template" id="inspic_tem_selectItem">'+
        '<span class="iconSelect">'+
        '<%var first=true;_.each(items, function(val,key){%><span class="iconSelectItem<%if(first){first=false;%> first<%}%> <%=key%>" value="<%=key%>" title="<%=val%>"></span><%});%>'+
        '</span>'+
        '</script>'+

    '<script type="text/template" id="inspic_tem_spinner">'+
        '<span class="inspic_spinner">'+
        '&nbsp;'+
        '<span class="inspic_up"><span class="up"></span></span>'+
        '<span class="inspic_dn"><span class="dn"></span></span>'+
        '</span>'+
        '</script>';

    inspic.injectTemplates=_.once(function(){
	$('head').append(head);
    });
    inspic.injectTemplates();

})(jQuery);