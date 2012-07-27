 
 
function statkartWPS(u)
{
    this.url = u; 
}


statkartWPS.prototype.doElevation = function(ref, cb) {
  var llref = ref.toLatLng();
  var rurl = this.url+"?request=Execute&service=WPS&version=1.0.0&"+
            "identifier=elevation&datainputs=[lat="+llref.lat+";lon="+llref.lng+";]";
  loadXml(rurl, cb);



function loadXml(xml_url, cbfunc) {
      return call(xml_url, this, callback, false, true); 
      
      function callback(xml) { 
        var x = parseResult(xml); 
        if (cbfunc)
            cbfunc(x);
      }
}


function getData(node)
{
   if (!node)
       return null;
   var dtype = node.getAttribute("dataType");
   var dtext = node.textContent;
   if (dtype == "string")
      return dtext; 
   else if (dtype == "integer")
      return parseInt(dtext, 10);
   else if (dtype == "float")
      return parseFloat(dtext);
}



function parseResult(xml_string) {
        if (xml_string.length < 10)
           return false;
        var xmlDocument =  (new DOMParser()).parseFromString(xml_string, "text/xml");
        var objDomTree = xmlDocument.documentElement;
        var result = new Array(); 
        
        var poutputs = objDomTree.getElementsByTagNameNS("*", "Output");
        for (var i=0; i<poutputs.length; i++) {
           var ident = poutputs[i].getElementsByTagNameNS("*", "Identifier");
           var data = poutputs[i].getElementsByTagNameNS("*", "LiteralData");

           if (ident && ident[0] && data) {
              var idx = ident[0].textContent; 
              result[idx] = getData(data[0]);
           }
        }
        return result;
}


}