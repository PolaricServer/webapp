 
 
function statkartAddress(u)
{
    this.url = u; 
}


statkartAddress.prototype.doSearch = function(srch, cb) {
  var rurl = this.url+"?antPerSide=50&side=0&sokestreng="+srch;
  loadJson(rurl, cb);



  function loadJson(json_url, cbfunc) {
      return call(json_url, this, callback, false, true); 
      
      function callback(json) { 
        var x = $.parseJSON(json); 
        if (cbfunc)
            cbfunc(toHtml(x));
      }
  }

  /* type, adressekode, adressenavn,
   * kortadressenavn, husnr, bokstav, undernr, 
   * postnr, poststed, kommunenr, kommunenavn, 
   * gardsnr, bruksnr, festenr, seksjonsnr, bruksnavn,
   * nord, aust 
   */

  function toHtml(x) // Consider doing this somewhere else
  {
     if (x.sokStatus.ok != "true")
       return "";
     
     var h = '<table>';
     var adr = x.adresser;
     for (var i=0; i<adr.length; i++) {
        var llref = new LatLng(parseFloat(adr[i].nord), parseFloat(adr[i].aust));
        h += '<tr onclick="gotoPos('+llref.lng + ','+llref.lat+')"><td>'
          +adr[i].adressenavn+'&nbsp'+adr[i].husnr + (adr[i].bokstav ? adr[i].bokstav : '')
          +'</td><td>'+adr[i].postnr+'</td><td>'+adr[i].poststed+'</td><td>'+adr[i].gardsnr+'/'+adr[i].bruksnr+'</tr>';
     }
     h+='</table>';
     return h;
  }

}