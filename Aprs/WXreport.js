   
function dateFromISO8601(isostr) {
   var parts = isostr.match(/\d+/g);
   return new Date(parts[0], parts[1] - 1, parts[2], parts[3], 
                    parts[4], parts[5]);
}
   
 
function WXreport(u)
{
   this.url = u; 
}


WXreport.prototype.doTextReport = function(ref, cb) {
  var llref = ref.toLatLng();
  var rurl = this.url+"/textlocation/1.0/?language=nb;latitude="+llref.lat+";longitude="+llref.lng+";";
  loadXml(rurl, cb);



function loadXml(xml_url, cbfunc) {
      return call(xml_url, this, callback, false, true); 
      
      function callback(xml) { 
        var x = parseResult(xml); 
        if (cbfunc)
            cbfunc(x);
      }
}



function parseResult(xml_string) {
        if (xml_string.length < 10)
           return false;
        var xmlDocument =  (new DOMParser()).parseFromString(xml_string, "text/xml");
        var objDomTree = xmlDocument.documentElement;
        var result = new Array(); 
        
        var poutputs = xmlDocument.getElementsByTagName("time");
        for (var i=0; i<poutputs.length; i++) {
           result[i] = new Array();
           result[i].from = dateFromISO8601(poutputs[i].getAttribute("from"));
           result[i].to = dateFromISO8601(poutputs[i].getAttribute("to"));
           var loc = poutputs[i].getElementsByTagName("location");        
           result[i].name =  loc[0].getAttribute("name");
          
           var fcast = loc[0].getElementsByTagName("forecast");
           result[i].fcast = fcast[0].textContent; 
        }
        return result;
}


}