 
 
function statkartName(u)
{
    this.url = u; 
}


statkartName.prototype.doSearch = function(name, cb) {
  var rurl = this.url+"?navn="+name;
  loadXml(rurl, cb);



function loadXml(xml_url, cbfunc) {
      return call(xml_url, this, callback, false, true); 
      
      function callback(xml) { 
        var x = parseResult(xml); 
        if (cbfunc)
            cbfunc(x);
      }
}

function getVal(node, name)
{
    return node.getElementsByTagName(name)[0].childNodes[0].nodeValue; 
}

function parseResult(xml_string) {
        if (xml_string.length < 10)
           return false;
        var xmlDocument =  (new DOMParser()).parseFromString(xml_string, "text/xml");
        var objDomTree = xmlDocument.documentElement;
        var result = new Array(); 
        
        var poutputs = objDomTree.childNodes;
        var j=0;
        for (var i=0; i<poutputs.length; i++) {
           if (poutputs[i].nodeName != "stedsnavn")
              continue; 
           result[j] = new Array();
           result[j].type = getVal(poutputs[i], "navnetype");
           result[j].kommune = getVal(poutputs[i], "kommunenavn");
           result[j].fylke = getVal(poutputs[i], "fylkesnavn");
           result[j].navn = getVal(poutputs[i], "stedsnavn");
           result[j].east = getVal(poutputs[i], "aust");
           result[j].north = getVal(poutputs[i], "nord");
           j++;
        }
        return result;
}


}