 

/****** Experimental ******/

var hist_call = "";
var hist_fromdate = null;
var hist_fromtime= null;
var hist_todate = null;
var hist_totime = null;


function searchHistData(call)
{
   if (hist_fromdate == null)
      hist_fromdate = formatDate(new Date());
   if (hist_todate == null)
      hist_todate = formatDate(new Date());
   if (hist_fromtime == null)
      hist_fromtime = formatTime(new Date());
   if (hist_totime == null)
      hist_totime = formatTime(new Date());   
   if (call != null)
      hist_call = call;
         
   var x = popupwindow(toolbar, 
        " <h1>Generere historisk spor</h1><hr><form> "+
        " Stasjon: <input type=\"text\"  size=\"10\" id=\"findcall\" value=\""
             + hist_call + "\"/><br> "+
        " Tid start: <input type=\"text\"  size=\"10\" id=\"tfrom\" value=\""
                 + hist_fromdate + 
              "\"/>&nbsp;<input type=\"text\"  size=\"4\" id=\"tfromt\" value=\""
                 + hist_fromtime + "\"/> <br> "+
        " Tid slutt: <input type=\"text\" size=\"10\" id=\"tto\" value=\""
                 + hist_todate + 
              "\"/>&nbsp;<input type=\"text\" size=\"4\" id=\"ttot\" value=\""
                 + hist_totime + "\"/> <br> "+
        " <input id=\"searchbutton\" type=\"button\"" +
            " value=\"Søk\" />"+
        "</form><br>", 50, 70, null, null, false);

        $('#searchbutton').click( function() {
           hist_call     = $('#findcall').val();
           hist_fromdate = $('#tfrom').val();
           hist_todate   = $('#tto').val();
           hist_fromtime = $('#tfromt').val();
           hist_totime   = $('#ttot').val();
           getHistXmlData( hist_call, hist_fromdate+"/"+hist_fromtime, hist_todate+"/"+hist_totime ); 
        });
            
        $('#tfrom').datepicker({ dateFormat: 'yy-mm-dd' });
        $('#tto').datepicker({ dateFormat: 'yy-mm-dd' });
        $(x).resizable();
}


function getHistXmlData(stn, tfrom, tto)
{
   abortCall(lastXmlCall);
   if (myOverlay != null) 
      myOverlay.removePoint(); 
   reloadXml = false;
   myOverlay.loadXml('srv/htrail?'+extentQuery() + "&scale="+currentScale+
                   '&station=' + stn + '&tfrom='+ tfrom + '&tto='+tto);
}


function formatDate(d)
{
    return ""+d.getFullYear() + "-" + 
       (d.getMonth()<10 ? "0" : "") + (d.getMonth()+1) + "-" +
       (d.getDate()<10 ? "0" : "")  + d.getDate();
}



function formatTime(d)
{
    return "" +
       (d.getHours()<10 ? "0" : "") + d.getHours() + ":" +
       (d.getMinutes()<10 ? "0" : "") + d.getMinutes();
}


