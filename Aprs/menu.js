var toolbar = document.getElementById('toolbar');
var gpsTracker = null; 


window.onmessage = receiveMessage; 


/* Receive and act on message from other window */
function receiveMessage(e)  
{   
  e = (e)?e:((event)?event:null);
  var result = null;
  
  var args = e.data.split("##");
  var op = args[0].split("#");
  
  if (op[0] == "zoomIn")
       myKaMap.zoomIn();
  else if (op[0] == "zoomOut")
       myKaMap.zoomOut();
  else if (op[0] == "zoomScale") {
      var scale = parseInt(args[1], 10); 
      if (isNaN(scale))
         return; 
      myKaMap.zoomToScale(scale); 
  }
  else if (op[0] == "gotoUtm") {
      var zz = args[1].substring(0,2);
      var nz = args[1].substring(2,3);
      gotoPos(args[2], args[3])
  }
  else if (op[0] == "findItem")
      findStation(args[1]);
  else if (op[0] == "selectMap")
      myKaMap.selectMap(args[1]);
  else if (op[0] == "selectBaseLayer")
      myKaMap.selectBaseLayer(args[1]);
  else if (op[0] == "echoTest")
      result = "Echo - your text was: "+args[1];
  
  if (result != null)
    e.source.postMessage(args[0]+"##"+result, e.origin);
  
} 



/************************************************************************
 * Context menu
 ************************************************************************/


var ctxtMenu = new ContextMenu(); 

function ContextMenu()
{
   this.callbacks = new Array(); 
   this.txt = new PopupMenu(null);
}



/* Context can be 'MAP', 'ITEM', SIGN or 'TOOLBAR' */

ContextMenu.prototype.addCallback = function (context, func)
{
   if (!this.callbacks[context])
      this.callbacks[context] = new Array();
   this.callbacks[context].push(func);
}




ContextMenu.prototype.show = function (i, e, ax, ay)
{
     var ident = i;
     e = (e)?e:((event)?event:null); 
     var x = (ax) ? ax : ((e.pageX) ? e.pageX : e.clientX); 
     var y = (ay) ? ay : ((e.pageY) ? e.pageY : e.clientY);
     var t = this; 
     var p = myOverlay.getPointObject(ident);
     var d = myKaMap.domObj;
     t.txt.clear();
     t.txt.ident = ident;
     t.txt.x = x;
     t.txt.y = y; 
     
     if (ident == null) {
          this.txt.add('Vis kartreferanse',  function () { setTimeout('showPosInfoPix('+x+', '+y+');',100); });
          if (WXreport_enable)
               this.txt.add('Værmelding', function() { setTimeout('showWxInfoPix('+x+', '+y+');',100); });
  
          if (canUpdate()) 
             this.txt.add('Legg på APRS objekt',function () { editObjectInfo(x, y);});
	  if (isAdmin())
	     this.txt.add('Sett egen posisjon', function () { setOwnPosition(x, y);});
	  
          this.txt.add(null);
          this.txt.add('Sentrer punkt', function()  { myZoomTo(x,y); });
          this.txt.add('Zoom inn', function() {myKaMap.zoomIn(); } );
          this.txt.add('Zoom ut',  function() {myKaMap.zoomOut(); } );
          _doCallback('MAP');
     }
                                     
     else if (ident == 'TOOLBAR') {   
          d = toolbar;
          this.txt.add('Finn APRS stasjon', function()  { setTimeout('searchStations();',100);}); 
          this.txt.add('Finn kartreferanse', function() { setTimeout('showRefSearch();',100); });
          this.txt.add('Finn stedsnavn', function()  { setTimeout('searchNames();',100);}); 
          
          
          if (canUpdate()) {                 
             this.txt.add('Legg inn objekt', function() { editObjectInfo(null, null); });
             this.txt.add('Slett objekt', function() { deleteObject(null); });
          }
          this.txt.add(null);
	  this.txt.add('Sett SAR kode', setSarCode);
	  if (isMobileApp) {          
	     if (gpsTracker==null || !gpsTracker.isActive())
                 this.txt.add('Aktiver GPS pos.', function() {  
                     if (gpsTracker==null) gpsTracker = new GpsTracker(); 
                     gpsTracker.activate(); 
                  } );
	     else
                 this.txt.add('De-aktiver GPS pos.', function() { gpsTracker.deactivate(); });

             if (!powerMgmt_locked)
                 this.txt.add('De-aktiver auto-slukking', powerMgmt_lock);
             else
                 this.txt.add('Aktiver auto-slukking', powerMgmt_unlock); 
	  }

          if (!traceIsHidden('ALL'))
             this.txt.add('Skjul sporlogger', function() { myOverlay.hidePointTrace('ALL'); });
          else
             this.txt.add('Vis sporlogger', function() { myOverlay.showPointTrace('ALL'); });
          this.txt.add(null);
          this.txt.add('Skriftstørrelse +', function() { labelStyle.next(); });
          this.txt.add('Skriftstørrelse -', function() { labelStyle.previous(); });
	  
          if (isAdmin() || canUpdate()) {
             this.txt.add(null);
             if (sarUrl) 
                this.txt.add('SAR URL', sarUrl);
             this.txt.add('SAR modus', sarModeWindow);
          }
          _doCallback('TOOLBAR');    
     }     
     
     
     else if (p != null && p.isSign) {
         this.txt.add('Vis info', function() { setTimeout( function() {showSignInfo(p, x, y); });}); 
         _doCallback('SIGN');
     }
     
     
     else {
          this.txt.add('Vis info', function() { showStationInfo(ident, false, x, y);});
          if (p != null && p.hasTrace)
             this.txt.add('Siste bevegelser', function() { showStationHistory(ident,x, y);});
          
          if (canUpdate()) { 
             this.txt.add('Globale innstillinger', function() { showStationInfo(ident, true);});
             if (p != null) { 
                if (p.own )
                   this.txt.add('Slett objekt', function() { deleteObject(ident); });
                else
                   this.txt.add('Nullstill info', function() { resetInfo(ident); });
             }   
          }
          
          this.txt.add(null);
          this.txt.add('Auto-sporing '+(isTracked(ident) ? 'AV' : 'PÅ'), function() { toggleTracked(ident); });
          if (!labelIsHidden(ident))
              this.txt.add('Skjul ident', function() { hidePointLabel(ident); } );
          else
              this.txt.add('Vis ident', function() { showPointLabel(ident); } );
              
          if (hasTrace(ident)) {
             if (!traceIsHidden(ident))
               this.txt.add('Skjul spor', function() { myOverlay.hidePointTrace(ident); });
             else
               this.txt.add('Vis spor', function() { myOverlay.showPointTrace(ident); });
          } 
          _doCallback('ITEM');
      }                       

     e.cancelBubble = true;       
     menuMouseSelect();                      
     this.txt.activate(d,x, y);

     
     function _doCallback(ctxt)
     {
       var lst = t.callbacks[ctxt]; 
       if (lst)
       for (i=0; i<lst.length; i++) {
          f = lst[i]; 
          if (f != null) 
             f(t.txt); 
       }    
     }
     
     
} 
 

function mainMenu(icn, e)
{
     e = (e)?e:((event)?event:null);
     x = icn.offsetLeft + 10; 
     y = icn.offsetTop + icn.offsetHeight - 2;
     ctxtMenu.show('TOOLBAR', e, x, y);
     e.cancelBubble = true;   
     return false; 
}

/************ End of Context menu stuff  *************/





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
    fullPopupWindow('Admin', server_url + 'srv/admin?cmd=info', 660, 500);
}

function sarModeWindow() {
    fullPopupWindow('SarMode', server_url + 'srv/sarmode', 460, 270);
}



function showSignInfo(p, x, y)
{ 
  var uref = new UTMRef(p.geox, p.geoy,  this.utmnzone,  this.utmzone);
  var llref = uref.toLatLng();
  var sref = "" + llref.toUTMRef();
  var ustring = showUTMstring(sref);
  var w = popupwindow(myKaMap.domObj,
       ' <span class="sleftlab">Beskrivelse:</span>' + p.title  +
       ' <br/><span class="sleftlab">UTM:</span>' + showUTMstring(sref) +
       ' <br/><nobr><span class="sleftlab">Latlong:</span>' + showDMstring(llref.lat)+"N, "+showDMstring(llref.lng)+"E"+
       '<div></div>'
       , x, y, null);
}



function showStationInfo(ident, edit, x, y)
{
  if (!edit)
      remotepopupwindow(myKaMap.domObj, 
           server_url + 'srv/station?ajax=true&simple=true&id='+ident+ (edit ? '&edit=true':''), x, y, 'infopopup');
      
  else {
      var url = server_url + (getLogin() ? 'srv/station_sec?id=' : 'srv/station?id=');
      fullPopupWindow('Stasjon', url + ident + (edit ? '&edit=true':''), 705, 500);
  } 
}



function sarUrl(x, y)
{
    var pl = document.getElementById("permolink").children[0].children[0].href;
    remotepopupwindow(myKaMap.domObj, server_url + 'srv/sarurl?url='+escape(pl),  50, 80); 
}



function showStationHistory(ident, x, y)
{
  remotepopupwindow( myKaMap.domObj,  
     server_url + 'srv/history?ajax=true&simple=true&id='+ident, x, y);
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
  };
}


function searchStations()
{  
     var xpos = 50; 
     var ypos = 70;
     var pdiv = popupwindow(document.getElementById("anchor"), 
        ' <div><h1>Finn APRS stasjon/objekt</h1><div id="searchform"><form> '+
        ' Tekst i ident/komment: <input type="text"  width="10" id="findcall"/> '+
        ' <input id="searchbutton" type="button"' +
            ' value="Søk" />' +
        '</form><br><div id="searchresult"></div></div></div>', xpos, ypos, null); 
     
     $('#searchbutton').click( function(e) {
         e = (e)?e:((event)?event:null);
         e.cancelBubble = true; 
         if (e.stopPropagation) e.stopPropagation();
         call(server_url + "srv/search?ajax=true&filter="+
	     $('#findcall').val()+(isMobile==true?"&mobile=true":""), null, searchStationCallback, false );
     });


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


function showUTMstring(sref)
{
   return sref.substring(0,5)+'<span class="kartref">' + sref.substring(5,8) + '</span>'+
          sref.substring(8,13)+'<span class="kartref">' + sref.substring(13,16) + '</span>'+
          sref.substring(16);
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




/* Zoom to pos and show marker there */
function gotoPos(x, y)
{
  doRefSearchUtm(x, y, this.utmnzone, this.utmzone, true)
}





var skNames = new statkartName(statkartName_url);


function searchNames()
{  
  var xpos = 50; 
  var ypos = 70;
  var pdiv = popupwindow(document.getElementById("anchor"), 
          ' <div><h1>Finn Stedsnavn (Kartverket)</h1><div id="searchform"><form> '+
          ' Navn: <input type="text"  width="10" id="findname"/> '+
          ' <input id="searchbutton" type="button"' +
          ' value="Søk" />' +
          '</form><br><div id="searchresult"></div></div></div>', xpos, ypos, null); 
  
  $('#searchbutton').click( function(e) {
     e = (e)?e:((event)?event:null);
     e.cancelBubble = true; 
     if (e.stopPropagation) e.stopPropagation();
     skNames.doSearch($('#findname').val(), searchCallback);  
    
  });
  
  
  function searchCallback(info)
  {  
    if (info == null) 
      return; 
    
    var x = (isMobile ? document.getElementById('searchform') : 
                        document.getElementById('searchresult'));
    if (x != null) {            
       var h = '<table>';
       for (var i=0; i<info.length; i++)
          h += '<tr onclick="gotoPos('+info[i].east+','+info[i].north+')"><td>'
              +info[i].navn+'</td><td>'+info[i].type+'</td><td>'+info[i].fylke+'</td></tr>';
    
       h+='</table>';
       x.innerHTML = h;
       
       /* To allow scrollbar to be added */
       removePopup();
       setTimeout(function() { popup(document.getElementById("anchor"), pdiv, xpos, ypos, null);}, 1000); 
    } 
    
  }
}








var wps = new statkartWPS(statkartWPS_url);

function showPosInfoUtm(uref, iconOnly)
{
    var llref = uref.toLatLng();
    var sref = "" + llref.toUTMRef();
    var ustring = showUTMstring(sref); 

    var nPixPos = myKaMap.geoToPix(uref.easting, uref.northing);
    
    if (iconOnly) {
       popupImage(myKaMap.domObj, nPixPos[0], nPixPos[1]);
       return;
    }
    var w = popupwindow(myKaMap.domObj, 
                 '<span class="sleftlab">UTM:</span>' + ustring +'<br>' +
                 '<nobr><span class="sleftlab">Latlong:</span>' + showDMstring(llref.lat)+"N, "+showDMstring(llref.lng)+"E" +'<br>'  + 
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
       var m = w.appendChild(createItem("Opprett APRS objekt her", 
                              function () { editObjectInfo(nPixPos[0], nPixPos[1]);menuMouseSelect();}));
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
        '<img title="Kilde: Meteorologisk institutt (met.no)" src="images/met.gif" align="right">'+
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
      txt = txt + " til " + d2.getDay()+"/"+days[ prevDay(d2.getDay())]; 
    else
      txt = txt + " til " + (d1.getDate() != d2.getDate() ? days[ d2.getDay()] : "") + " kl. "+h2;
  }
  return txt;
  
  function prevDay(x) {
    return x -1; 
  }
}
