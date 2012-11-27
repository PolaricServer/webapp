var toolbar = document.getElementById('toolbar');
var gpsTracker = null; 


window.onmessage = receiveMessage; 




function receiveMessage(e)  
{        
  e = (e)?e:((event)?event:null);
  var args = e.data.split(" ");
  if (args[0] == "zoomIn")
       myKaMap.zoomIn();
  else if (args[0] == "zoomOut")
       myKaMap.zoomOut();
  else if (args[0] == "zoomScale") {
      var scale = parseInt(args[1], 10); 
      if (isNaN(scale))
         return; 
      myKaMap.zoomToScale(scale); 
  }
  else if (args[0] == "gotoUtm") {
      var zz = args[1].substring(0,2);
      var nz = args[1].substring(2,3);
      doRefSearchUtm(args[2], args[3], nz, zz, true)
  }
  else if (args[0] == "findItem")
      findStation(args[1]);
  else if (args[0] == "selectMap")
      myKaMap.selectMap(args[1]);
} 




function showContextMenu(ident, e, ax, ay)
{
     e = (e)?e:((event)?event:null); 
     var x = (ax) ? ax : ((e.pageX) ? e.pageX : e.clientX); 
     var y = (ay) ? ay : ((e.pageY) ? e.pageY : e.clientY);
     
     var p = myOverlay.getPointObject(ident);
     var d = myKaMap.domObj;
     if (ident == null) {
          var txt = new Array( ['Vis kartreferanse',  function () { setTimeout('showPosInfoPix('+x+', '+y+');',100); } ]);
          if (WXreport_enable)
               txt.push(['Værmelding', function() { setTimeout('showWxInfoPix('+x+', '+y+');',100); } ]);
          
          if (canUpdate()) 
             txt.push(['Legg på APRS objekt', function () { editObjectInfo(x, y);} ]);
	  if (isAdmin())
	     txt.push(['Sett egen posisjon', function () { setOwnPosition(x, y);} ]);
	  
          txt.push(null);
          txt.push(['Sentrer punkt', function()  { myZoomTo(x,y); } ]);
          txt.push(['Zoom inn', function()  { myZoomTo(x,y); myKaMap.zoomIn();} ]);
          txt.push(['Zoom ut', function()  { myKaMap.zoomOut(); } ] );
     }
                                     
     else if (ident == 'TOOLBAR') {
          d = toolbar;
          txt = new Array( ['Finn APRS stasjon', function()  { setTimeout('searchStations();',100);} ],
                           ['Finn kartreferanse', function() { setTimeout('showRefSearch();',100); } ]);
          if (canUpdate()) {                 
             txt.push(['Legg inn objekt', function() { editObjectInfo(null, null); } ]);
             txt.push(['Slett objekt', function() { deleteObject(null); } ]);
          }
          txt.push(null);
          
	  if (isMobileApp) {   
             txt.push(['Sett SAR nøkkel', function()  { setTimeout('setSarCode();',100);}]);
	     if (gpsTracker==null)
	          txt.push(['Aktiver GPS pos.', function() { gpsTracker = new GpsTracker(); gpsTracker.activate(); } ]);
	     else
	          txt.push(['De-aktiver GPS pos.', function() { gpsTracker.deactivate(); gpsTracker=null; } ]);
	     if (!powerMgmt_locked)
                  txt.push(['De-aktiver auto-slukking', powerMgmt_lock ]);
             else
                  txt.push(['Aktiver auto-slukking', powerMgmt_unlock ]);
          }
          
	  txt.push(null);
          if (!traceIsHidden('ALL'))
            txt.push(['Skjul sporlogger', function() { myOverlay.hidePointTrace('ALL'); } ]);
          else
            txt.push(['Vis sporlogger', function() { myOverlay.showPointTrace('ALL'); } ]);
          txt.push(null);
          txt.push(['Skriftstørrelse +',           function() { labelStyle.next(); } ]);
          txt.push(['Skriftstørrelse -',           function() { labelStyle.previous(); } ]);
          
          if (isAdmin() || canUpdate()) {
             txt.push(null);
             if (sarUrl) 
                  txt.push(['SAR URL', sarUrl ]);
             txt.push(['SAR modus', sarModeWindow ]);
          }
          if (isAdmin()) {          
             txt.push(['Server info (admin)', adminWindow ]);
          }
     }     
     else {
          txt = new Array( ['Vis info', function() { showStationInfo(ident, false, x, y);} ]);
          if (p != null && p.hasTrace)
               txt.push( ['Siste bevegelser', function() { showStationHistory(ident,x, y);} ]);
          
          if (canUpdate()) { 
             txt.push( ['Globale innstillinger', function() { showStationInfo(ident, true);} ]);
             if (p != null) { 
                if (p.own )
                   txt.push( ['Slett objekt', function() { deleteObject(ident); }]);
                else
                   txt.push( ['Nullstill info', function() { resetInfo(ident); }]);
             }   
          }
          
          txt.push(null);
          txt.push(['Auto-sporing '+(isTracked(ident) ? 'AV' : 'PÅ'), function() { toggleTracked(ident); } ]);
          if (!labelIsHidden(ident))
              txt.push(['Skjul ident', function() { hidePointLabel(ident); } ]);
          else
              txt.push(['Vis ident', function() { showPointLabel(ident); } ]);
              
          if (hasTrace(ident)) {
             if (!traceIsHidden(ident))
               txt.push(['Skjul spor', function() { myOverlay.hidePointTrace(ident); }]);
             else
               txt.push(['Vis spor', function() { myOverlay.showPointTrace(ident); }]);
          } 
      }                       

     e.cancelBubble = true;       
     menuMouseSelect();                     
     popupmenu(d, txt, null, x, y);
} 
 


function mainMenu(icn, e)
{
     e = (e)?e:((event)?event:null);
     x = icn.offsetLeft + 10; 
     y = icn.offsetTop + icn.offsetHeight - 2;
     showContextMenu('TOOLBAR', e, x, y);
     e.cancelBubble = true;   
     return false; 
}




function findStation(ident, showInfo)
{   
    /* AJA(X) call to find station */ 
    call(server_url + "srv/findstation?ajax=true&id="+ident, null, findStationCallback, false); 
    
    function findStationCallback(info)
    {
       if (info == null)
         return; 
        
      /* The returned info should be three tokens delimited by commas: 
       * an id (string) and x and y coordinates (number)
       */
      var args = info.split(/\s*,\s*/g);
      if (args == null || args.length < 3)
         return;
       var x = parseInt(args[1], 10);
       var y = parseInt(args[2], 10);
       if (isNaN(x) || isNaN(y))
          return;
       myKaMap.zoomTo(x, y);
       removePopup();
       if (showInfo) 
          setTimeout(function() { showStationInfoGeo(args[0], false, x,  y );}, 1400);
       setTimeout(function() { var x = myOverlay.getPointObject(args[0]); 
                               if (x!=null) x.moveToFront(); }, 3500);   
    }
}



function showStationInfoGeo(ident, edit, x, y)
{
    var pixPos = myKaMap.geoToPix(x, y);
    showStationInfo(ident, false, pixPos[0]+12, pixPos[1]+10);
}



function editObjectInfo(x, y)
{
    var coord = myKaMap.pixToGeo(x, y);
    fullPopupWindow('Objekt', server_url + 'srv/addobject' +
          (x==null ? "" : '?x=' + coord[0] + '&y='+ coord[1]), 495, 280);
}



function setOwnPosition(x, y)
{
    var coord = myKaMap.pixToGeo(x, y);
    fullPopupWindow('Posisjon', server_url + 'srv/setownpos' +
          (x==null ? "" : '?x=' + coord[0] + '&y='+ coord[1]), 495, 200);
}


function deleteObject(ident) {
    fullPopupWindow('Objekt', server_url + 'srv/deleteobject'+ (ident==null ? "" : '?objid='+ident), 350, 200);
}

function resetInfo(ident) {
    fullPopupWindow('Stasjon', server_url + 'srv/resetinfo'+ (ident==null ? "" : '?objid='+ident), 350, 200);
}

function deleteAllObjects() {
    fullPopupWindow('Objekt', server_url + 'srv/deleteallobj', 350, 230);
}

function adminWindow() {
    fullPopupWindow('Admin', server_url + 'srv/admin?cmd=info', 630, 460);
}

function sarModeWindow() {
    fullPopupWindow('SarMode', server_url + 'srv/sarmode', 460, 270);
}



function showStationInfo(ident, edit, x, y)
{
  if (!edit)
      remotepopupwindow(myKaMap.domObj, 
      server_url + 'srv/station?ajax=true&simple=true&id='+ident+ (edit ? '&edit=true':''), x, y, 'infopopup');
  else {
      var url = server_url + (getLogin() ? 'srv/sec-station?id=' : 'srv/station?id=');
      fullPopupWindow('Stasjon', url + ident + (edit ? '&edit=true':''), 715, 5040);
  } 
}



function sarUrl(x, y)
{
    var pl = document.getElementById("permolink").children[0].children[0].href;
    remotepopupwindow(myKaMap.domObj, server_url + 'srv/sarurl?ajax=true&url='+escape(pl),  50, 80); 
}



function showStationHistory(ident, x, y)
{
   remotepopupwindow(document.getElementById("anchor"),  server_url + 'srv/history?ajax=true&simple=true&id='+ident, x, y);
}


function setSarCode()
{  
  var xpos = 50; 
  var ypos = 70;
  var pdiv = popupwindow(document.getElementById("anchor"), 
                         ' <div><h1>Sett SAR kode</h1><div id="sarcodeform"><form> '+
                         ' Kode: <input type="text" style="width: 6em" width="6" id="sarcode" value="'+ (sar_key==null ? '' : sar_key) + '"/>&nbsp; '+
                         ' <input id="sarcodebutton" type="button"' +
                         ' value="Bekreft" /></div><br></div>', xpos, ypos, null); 
  
  
  document.getElementById("sarcodebutton").onclick = function(e) {
    var code = document.getElementById('sarcode').value;
    if (code == "" || code == " ")
      code = null;
    sar_key = code; 
    storage.removeItem('polaric.sarkey');
    storage['polaric.sarkey'] = code;
    e.cancelBubble = true; 
    if (e.stopPropagation) e.stopPropagation();  
    removePopup();
  };
}


function searchStations()
{  
     var xpos = 50; 
     var ypos = 70;
     var pdiv = popupwindow(document.getElementById("anchor"), 
        " <div><h1>Finn APRS stasjon/objekt</h1><div id=\"searchform\"><form> "+
        " Tekst i ident/komment: <input type=\"text\"  width=\"10\" id=\"findcall\"/> "+
        " <input id=\"searchbutton\" type=\"button\"" +
            " value=\"Søk\" />"+
          "</form><br><div id=\"searchresult\"></div></div></div>", xpos, ypos, null); 
     
     document.getElementById("searchbutton").onclick = function(e) {
         var srch = document.getElementById('findcall').value;
         e.cancelBubble = true; 
         if (e.stopPropagation) e.stopPropagation();
         call(server_url + "srv/search?ajax=true&filter="+srch+(isMobile==true?"&mobile=true":""), null, searchStationCallback, false);  
     };


    function searchStationCallback(info)
    {  
        if (info == null) 
           return; 

        var x = (isMobile ? document.getElementById('searchform') : 
                            document.getElementById('searchresult'));
        if (x != null) {            
            x.innerHTML = info;
            removePopup();
            setTimeout(function() { popup(document.getElementById("anchor"), pdiv, xpos, ypos, null);}, 500);          
        }    
    }
}


/* Autojump stuff */
var downStrokeField;
function autojump(fieldId, nextFieldId)
{
   var myField=document.getElementById(fieldId);             
   myField.nextField=document.getElementById(nextFieldId); 
   myField.onkeydown=autojump_keyDown;
   myField.onkeyup=autojump_keyUp;
}




function autojump_keyDown()
{
   this.beforeLength=this.value.length;
   downStrokeField=this;
}




function autojump_keyUp()
{
   if (
    (this == downStrokeField) && 
    (this.value.length > this.beforeLength) && 
    (this.value.length >= this.maxLength)
   )
      this.nextField.focus();
   downStrokeField=null;
}

/* End of autojump stuff */



function showRefSearch()
{
   /* TODO: Mulighet for å skrive inn kartreferanse i maidenhead */
    var ext = myKaMap.getGeoExtents();
    var cref = new UTMRef((ext[0]+ext[2])/2, (ext[1]+ext[3])/2, this.utmnzone, this.utmzone);
    cref = cref.toLatLng().toUTMRef(); 


   popupwindow(myKaMap.domObj, 
     "<h1>Vis kartreferanse på kartet</h1>" +
     "<form class=\"mapref\">"+
          
     "<hr><span class=\"sleftlab\">Kartref: </span>" +
     "<div><input id=\"locx\" type=\"text\" size=\"3\" maxlength=\"3\">"+
     "<input id=\"locy\" type=\"text\" size=\"3\" maxlength=\"3\">"+
     
     "&nbsp;<input type=\"button\" "+
     "   onclick=\"doRefSearchLocal(document.getElementById('locx').value, document.getElementById('locy').value)\""+ 
     "   value=\"Finn\">&nbsp;</div>"+
     
     "<hr><span class=\"sleftlab\">UTM: </span>"+
     "<nobr><div><input id=\"utmz\" type=\"text\" size=\"2\" maxlength=\"2\" value=\"" +cref.lngZone+ "\">" +
     "<input id=\"utmnz\" type=\"text\" size=\"1\" maxlength=\"1\" value=\"" +cref.latZone+ "\">" +
     "&nbsp;&nbsp<input id=\"utmx\" type=\"text\" size=\"6\" maxlength=\"6\">"+
     "<input id=\"utmy\" type=\"text\" size=\"7\" maxlength=\"7\">"+
     
     "&nbsp;<input type=\"button\" "+
     "   onclick=\"doRefSearchUtm(document.getElementById('utmx').value, document.getElementById('utmy').value, "+ 
     "     document.getElementById('utmnz').value, document.getElementById('utmz').value)\""+
     "   value=\"Finn\" style=\"margin-right:3.5em\">&nbsp;</div></nobr>" +
     
     "<hr><span class=\"sleftlab\">LatLong: </span>" +
     "<nobr><div><input id=\"ll_Nd\" type=\"text\" size=\"2\" maxlength=\"2\">°&nbsp;"+
     "<input id=\"ll_Nm\" type=\"text\" size=\"6\" maxlength=\"6\">'N&nbsp;&nbsp;"+
     "<input id=\"ll_Ed\" type=\"text\" size=\"2\" maxlength=\"2\">°&nbsp;"+
     "<input id=\"ll_Em\" type=\"text\" size=\"6\" maxlength=\"6\">'E"+
     "&nbsp;<input type=\"button\" "+
     "   onclick=\"doRefSearchLatlong(document.getElementById('ll_Nd').value, document.getElementById('ll_Nm').value, "+
     "        document.getElementById('ll_Ed').value, document.getElementById('ll_Em').value)\""+ 
     "   value=\"Finn\">&nbsp;</div></nobr><hr>"+
     "</form>" 
     
   , (isMobile? 20:50), (isMobile?53:70), false);
   
      autojump('utmz', 'utmnz');
      autojump('utmnz', 'utmx');
      autojump('utmx', 'utmy');
      autojump('locx', 'locy');
      autojump('ll_Nd', 'll_Nm');
      autojump('ll_Nm', 'll_Ed');
      autojump('ll_Ed', 'll_Em');
}


function doRefSearchLatlong(nd, nm, ed, em)
{  
   removePopup();
   var yd = parseInt(nd, 10);
   var ym = parseFloat(nm);
   var xd = parseInt(ed, 10);
   var xm = parseFloat(em);
   var ll = new LatLng(yd+ym/60, xd+xm/60);
   var uref = ll.toUTMRef();
   _doRefSearchUtm(uref);
}


function doRefSearchUtm(ax, ay, nz, zz, hide)
{
   removePopup();
   var x = parseInt(ax, 10);
   var y = parseInt(ay, 10);
   var z = parseInt(zz, 10);
   if (isNaN(x) || isNaN(y) || isNaN(z))
      return;
   var uref = new UTMRef(x, y, nz, z);
   _doRefSearchUtm(uref, hide);
}


function doRefSearchLocal(ax, ay)
{   removePopup();
    var x = parseInt(ax, 10);
    var y = parseInt(ay, 10);
    if (isNaN(x) || isNaN(y))
      return;
    
    var ext = myKaMap.getGeoExtents();
    var cref = new UTMRef((ext[0] + ext[2]) / 2, (ext[1] + ext[3]) / 2,  this.utmnzone,  this.utmzone);
    cref = cref.toLatLng().toUTMRef(); 
    var bx = Math.floor(cref.easting  / 100000) * 100000;
    var by = Math.floor(cref.northing / 100000) * 100000; 
    var uref = new UTMRef(bx + x * 100,  by + y * 100, cref.latZone, cref.lngZone); 

    /* TODO: We should actually try to show a 100x100m area */
    _doRefSearchUtm(uref);
}


function _doRefSearchUtm(uref, hide) {
    /* This is a hack, but the coordinates need to be in the same zone as the map */
    var uref_map = uref.toLatLng().toUTMRef(this.utmnzone, this.utmzone);
    myKaMap.zoomTo(uref_map.easting, uref_map.northing);
    setTimeout( function() { showPosInfoUtm(uref_map, hide);}, 1500 );
}


function showDMstring(ll)
{
    deg = Math.floor(ll);
    minx = ll - deg;
    if (ll < 0 && minx != 0.0) {
      minx = 1 - minx;
    }
    mins = Math.round( minx * 60 * 100) / 100;
    return ""+deg+"° "+mins+"'";
}

 

function showPosInfoPix(x, y)
{
    var coord = myKaMap.pixToGeo(x, y);
    showPosInfo(coord);
}


function showPosInfo(coords)
{
    showPosInfoUtm( new UTMRef(coords[0], coords[1], this.utmnzone, this.utmzone)); 
}


var wps = new statkartWPS(statkartWPS_url);

function showPosInfoUtm(uref, iconOnly)
{
    var llref = uref.toLatLng();
    var sref = "" + llref.toUTMRef();
    var ustring = sref.substring(0,5)+"<span class=\"kartref\">"+sref.substring(5,8)+"</span>"+
                  sref.substring(8,13)+"<span class=\"kartref\">"+sref.substring(13,16)+"</span>"+
                  sref.substring(16);
           
    var nPixPos = myKaMap.geoToPix(uref.easting, uref.northing);
    
    if (iconOnly) {
       popupImage(myKaMap.domObj, nPixPos[0], nPixPos[1]);
       return;
    }
    var w = popupwindow(myKaMap.domObj, 
                 '<span class="sleftlab">UTM:</span>' + ustring +'<br>' +
                 '<nobr><span class="sleftlab">Latlong:</span>' + showDMstring(llref.lat)+"N, "+showDMstring(llref.lng)+"E" +"<br>"  + 
                 '</nobr><span class="sleftlab">Loc:</span>' + ll2Maidenhead(llref.lat, llref.lng) +
                 '<div title="kilde: kartverket (WPS)" id="wpsresult"></div>',                 
                 nPixPos[0], nPixPos[1], true);

    if (statkartWPS_enable) 
      wps.doElevation(uref, function(wdata) {
         if (!wdata.terrain && !wdata.placename && !wdata.elevation)
             return; 
         var txt = ""; 
         if (wdata.placename) 
             txt += '<span class="sleftlab">Sted:</span>' + wdata.placename +'<br>';
         txt += '<span class="sleftlab">Terreng:</span>' + wdata.terrain +'<br>';
         if (wdata.elevation) 
             txt += '<span class="sleftlab">Høyde:</span>' + Math.round(wdata.elevation) +' moh<br>';
         document.getElementById("wpsresult").innerHTML = txt; 
      });
    
    if (canUpdate()) {
      var hr = w.appendChild(document.createElement("hr"));
      hr.style.marginBottom = "0";
      hr.style.marginTop = "0.2em";
      var m = w.appendChild(_createItem("Opprett APRS objekt her", function () 
      { editObjectInfo(nPixPos[0], nPixPos[1]);menuMouseSelect();}));
      m.style.width = "12em";
    }
}


/* Weather report from met.no */

var wx = new WXreport(WXreport_url);

function showWxInfoPix(x, y) {
  var coord = myKaMap.pixToGeo(x, y);
  var u = new UTMRef(coord[0], coord[1], this.utmnzone, this.utmzone);
  showWxInfo(u);
}


function showWxInfo(uref) {
  var llref = uref.toLatLng();
  var nPixPos = myKaMap.geoToPix(uref.easting, uref.northing);
  
  var w = popupwindow(myKaMap.domObj, 
        '<img title="Kilde: Meteorologisk institutt (metno)" src="images/met.gif" align="right">'+
        '<h3>Værmelding fra met.no</h3>' +
        '<div id="wxresult"></div>', 
         nPixPos[0], nPixPos[1], false);
                      
  wx.doTextReport(uref, function(wdata) {
    var txt = writefcast(wdata[0]); 
    txt += writefcast(wdata[1]);
    if (!isMobileApp)
        txt += writefcast(wdata[2]);
    var z = document.getElementById("wxresult"); 
    z.innerHTML = txt;
    
    function writefcast(x) { return '<h4 head="wxhead">'+dateFormat(x.from, x.to) 
                                  +" ("+x.name+")</h4>" + x.fcast; }
  });
}


function dateFormat(d1, d2) {
  var txt = "";
  var days = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag']; 
  var today = new Date();
  var h1 = d1.getHours(), h2 = d2.getHours();
  if (h1 < 10) h1 = '0'+h1;
  if (h2 < 10) h2 = '0'+h2;
  txt = days[d1.getDay()];
  if (d1.getDate() > today.getDate() && d1.getHours() > 0)
    txt = txt + " kl." + h1;
  if ( (d2.getDate() > d1.getDate()+1 || d2.getHours() > 0) ) {
    if (d2.getHours() == 0)
      txt = txt + " til " + days[ prevDay(d2.getDay())]; 
    else
      txt = txt + " til " + (d1.getDate() != d2.getDate() ? days[ d2.getDay()] : "") + " kl. "+h2;
  }
  return txt;
  
  function prevDay(x) {
      return x -1; 
  }
}