var toolbar = document.getElementById('toolbar');
var gpsTracker = null; 

var ctxtMenu = new ContextMenu(); 


/* 
 * Callback functions that define default content for context menus: 
 * 'MAP', 'ITEM', 'SIGN' and 'MAIN' 
 */ 

/************************************************
 * Context 'MAP' - click on map 
 ************************************************/

ctxtMenu.addCallback('MAP', function(m) 
{
  
  m.add(_('Show map reference'), function () { setTimeout('popup_posInfoPix('+m.x+', '+m.y+');',100); });
  if (WXreport_enable)
    m.add(_('WX report (Norway)'), function() { setTimeout('popup_wxInfoPix('+m.x+', '+m.y+');',100); });
  
  if (canUpdate()) 
    m.add(_('Add APRS object'), function () { popup_editObject(m.x, m.y);});
  if (isAdmin())
    m.add(_('Set own position'), function () { popup_setOwnPos(m.x, m.y);});
  
  m.add(null);
  m.add(_('Center point'), function()  { myKaMap.zoomToPix(m.x, m.y); });
  m.add(_('Zoom in'), function() {myKaMap.zoomIn(); } );
  m.add(_('Zoom out'),  function() {myKaMap.zoomOut(); } );
});



/************************************************
 * Context 'MAIN' - main menu on toolbar
 ************************************************/

ctxtMenu.addCallback('MAIN', function(m)
{
  m.d = toolbar;
  m.add(_('Search station/object'), function()  { setTimeout('popup_searchItems();',100);}); 
  m.add(_('Find map reference'), function() { setTimeout('popup_refSearch();',100); });
  if (statkartName_enable)
    m.add(_('Find location name (Norway)'), function()  { setTimeout('popup_searchNames();',100);}); 
  
  
  if (canUpdate()) {                 
    m.add(_('Add object'), function() { popup_editObject(null, null); });
    m.add(_('Remove object'), function() { popup_deleteObject(null); });
  }
  if (canUpdate())
    m.add(_('Send instant message'), function()  { setTimeout('popup_sendMessage();',100);});
  
  m.add(null);
  if (isMobileApp) {   
    m.add(_('Set SAR code'), popup_setSarKey);
    if (gpsTracker==null || !gpsTracker.isActive())
      m.add(_('Activate GPS pos.'), function() {  
        if (gpsTracker==null) gpsTracker = new GpsTracker(); 
            gpsTracker.activate(); 
      } );
    else
      m.add(_('De-activate GPS pos.'), function() { gpsTracker.deactivate(); });
    m.add(_('Change language'), function() { popup_setLanguage(); } ); 
  }
  
  if (!traceIsHidden('ALL'))
    m.add(_('Hide traces'), function() { myOverlay.hidePointTrace('ALL'); });
  else
    m.add(_('Show traces'), function() { myOverlay.showPointTrace('ALL'); });
  m.add(null);
  m.add(_('Font size +'), function() { labelStyle.next(); });
  m.add(_('Font size -'), function() { labelStyle.previous(); });
  
  if (isAdmin() || canUpdate()) {
    m.add(null);
    if (sarUrl) 
      m.add(_('SAR URL'), popup_sarUrl);
    m.add(_('SAR mode'), popup_sarMode);
    m.add(null);
    m.add(_('Log out'), logout);
  }
  else if (!isMobileApp) {
     m.add(null); 
     m.add(_('Log in'), function() { window.location = 'login.php'; });
  }    
}); 


/************************************************
 * Context 'SIGN' 
 ************************************************/

ctxtMenu.addCallback('SIGN', function(m) {
  m.add(_('Show info'), function() { setTimeout( function() {popup_signInfo(m.p, m.x, m.y); });});  
});



/************************************************
 * Context 'ITEM' - APRS object/station
 ************************************************/

ctxtMenu.addCallback('ITEM', function(m)
{
  m.add(_('Show info'), function() { popup_stationInfo(m.ident, false, m.x, m.y);});
  
  if (m.p.flags.match("t"))
     m.add(_('Telemetry'), function() { popup_telemetry(m.ident, m.x, m.y);});
  
  if (m.p != null && m.p.hasTrace)
    m.add(_('Last movements'), function() { popup_stationHistory(m.ident, m.x, m.y);});
  
  if (canUpdate()) { 
    m.add(_('Global settings..'), function() { popup_stationInfo(m.ident, true);});
    m.add(_('Manage tags..'), function() { popup_setTag(m.ident, m.x, m.y);});

    if (m.p != null) { 
      if ( m.p.own )
        m.add(_('Remove object'), function() { popup_deleteObject(m.ident); });
      else
        m.add(_('Reset info'), function() { popup_resetInfo(m.ident); });
    }   
  }
  
  m.add(null);
  m.add(_('Auto-tracking') + ' '+ (isTracked(m.ident) ? _('OFF') : _('ON')), function() { toggleTracked(m.ident); });
  if (!labelIsHidden(m.ident))
    m.add(_('Hide ident'), function() { hidePointLabel(m.ident); } );
  else
    m.add(_('Show ident'), function() { showPointLabel(m.ident); } );
  
  if (hasTrace(ident)) {
    if (!traceIsHidden(m.ident))
      m.add(_('Hide trail'), function() { myOverlay.hidePointTrace(m.ident); });
    else
      m.add(_('Show trail'), function() { myOverlay.showPointTrace(m.ident); });
  }
});




function popup_setTag(ident, x, y)
{
     var coord = myKaMap.pixToGeo(x, y);
     fullPopupWindow('editTags', server_url + 'srv/addtag?objid='+ident + '&lang='+language +
        (x==null ? "" : '&x=' + coord[0] + '&y='+ coord[1] ), 560, 300);
}


/*************************************************************
 * Popup window to edit/add object info (logged in users only)
 * call to server: 'addobject'
 *************************************************************/

function popup_editObject(x, y)
{
    var coord = myKaMap.pixToGeo(x, y);
    fullPopupWindow('editObject', server_url + 'srv/addobject' + '?lang='+language +
          (x==null ? "" : '&x=' + coord[0] + '&y='+ coord[1] ), 560, 300);
}


/***********************************************************
 * Popup window to set own position (admin users only)
 * call to server: 'setownpos'
 ***********************************************************/
function popup_setOwnPos(x, y)
{
    var coord = myKaMap.pixToGeo(x, y);
    fullPopupWindow('Position', server_url + 'srv/setownpos' + '?lang='+language +
           (x==null ? "" : '&x=' + coord[0] + '&y='+ coord[1]), 500, 200);
}


/***********************************************************
 * Popup window to delete object (logged in users only)
 * call to server: 'deleteobject'
 ***********************************************************/

function popup_deleteObject(ident) {
     fullPopupWindow('delObject', server_url + 'srv/deleteobject'+ '?lang='+language +
            (ident==null ? "" : '&objid='+ident), 350, 180);
}


/***************************************************************
 * Popup window to reset info about item (logged in users only)
 * call to server: 'resetinfo'
 ***************************************************************/

function popup_resetInfo(ident) {
     fullPopupWindow('Station', server_url + 'srv/resetinfo'+ '?lang='+language +
            (ident==null ? "" : '&objid='+ident), 360, 180);
}



/***********************************************************
 * Popup window to set SAR mode (logged in users only)
 * call to server: 'sarmode'
 ***********************************************************/ 

function popup_sarMode() {
     fullPopupWindow('SarMode', server_url + 'srv/sarmode' + '?lang='+language , 500, 320);
}


/***********************************************************
 * Popup window to show info about sign (simple object) 
 *   p - point object from XmlOverlay
 *   x,y - screen position
 ***********************************************************/

function popup_signInfo(p, x, y)
{ 
  var llref = new LatLng(p.geoy, p.geox);
  var sref = "" + llref.toUTMRef();
  var ustring = showUTMstring(sref);
  var w = popupwindow(myKaMap.domObj,
       ' <span class="sleftlab">'+_('Description')+':</span>' + p.title  +
       ' <br/><span class="sleftlab">UTM:</span>' + showUTMstring(sref) +
       ' <br/><nobr><span class="sleftlab">Latlong:</span>' + showDMstring(llref.lat)+"N, "+showDMstring(llref.lng)+"E"+
       ' <div></div>'
       , x, y, null);
}



/***************************************************************
 * Popup window to show or edit Station/object info
 *   ident - identifier of station or object
 *   edit  - true if we want to edit it. Only for logged in users
 * 
 * call to server: 'station' or 'station_sec' 
 ***************************************************************/

function popup_stationInfo(ident, edit, x, y)
{
  if (!edit)
      remotepopupwindow(myKaMap.domObj, 
           server_url + 'srv/station?lang=' + language +'&ajax=true&simple=true&id=' + ident + 
           (edit ? '&edit=true':''), x, y, 'infopopup');
      
  else {
      var url = server_url + (getLogin() ? 'srv/station_sec?id=' : 'srv/station?id=');
      fullPopupWindow(_('Station'), url + ident + (edit ? '&edit=true':'') + '&lang='+language, 780, 600);
  } 
}


function popup_stationInfoGeo(ident, edit, x, y)
{
  var pixPos = myKaMap.geoToPix(x, y);
  popup_stationInfo(ident, false, pixPos[0]+12, pixPos[1]+10);
}


/*******************************************
 * Telemetry 
 *******************************************/

function popup_telemetry(ident, x, y)
{
  var pdiv = remotepopupwindow(myKaMap.domObj, server_url + 'srv/telemetry?lang=' + language + '&id=' + ident, x, y, 'infopopup');
  setTimeout(function() { 
     $('#listbutton').click( function(e) {
        var url = server_url + 'srv/telhist?lang=' + language + '&id=' + ident;
        call( url, null, tlmhist_callback, false );
      }); }, 2000);
  


  function tlmhist_callback(info)
  {  
    if (info == null) 
      return; 
    
    var x = document.getElementById('tlmhist');
    if (x != null) {            
      x.innerHTML = info;
      $('#listbutton').hide();
      /* Remove and popup again to get it to add scrollbar correctly */
      removePopup();
      setTimeout(function() { popup(myKaMap.domObj, pdiv, x, y, null);}, 500);          
    }    
  }
}


/***********************************************************
 * Popup window to get SAR URL (with SAR key) from server 
 *   call to server: 'sarurl'
 ***********************************************************/

function popup_sarUrl(x, y)
{
    var pl = document.getElementById("permolink").children[0].children[0].href;
    remotepopupwindow(myKaMap.domObj, server_url + 'srv/sarurl?url='+escape(pl) + '&lang='+language,  50, 80); 
}



/***********************************************************
 * Popup window to search in station history 
 *   call to server: 'history'
 ***********************************************************/

function popup_stationHistory(ident, x, y)
{
  remotepopupwindow( myKaMap.domObj,  
     server_url + 'srv/history?ajax=true&lang='+language+'&simple=true&id='+ident, x, y);
}



/***********************************************************
 * Popup window to get SAR key from user 
 *  uses api function setSarKey()
 ***********************************************************/

function popup_setSarKey()
{  
  var xpos = 50; 
  var ypos = 70;
  var pdiv = popupwindow(document.getElementById("anchor"), 
         ' <div><h1>'+_('Set SAR code')+'</h1><div id="sarcodeform"><form> '+
         ' '+_('Code')+': <input type="text" style="width: 6em" width="6" id="sarcode" value="'+ (sar_key==null ? '' : sar_key) + '"/>&nbsp; '+
         ' <input id="sarcodebutton" type="button"' +
         ' value="'+_('Confirm')+'" /></div><br></div>', 
         xpos, ypos, null); 
  
  
  $('#sarcodebutton').click( function(e) {
    var code = $('#sarcode').val();
    if (code == "" || code == " ")
      code = null;
    setSarKey(code);
    
    removePopup();
    e.cancelBubble = true; 
    if (e.stopPropagation) e.stopPropagation();  
  });
}


/***********************************************************
 * Popup window to search items (stations/objects)
 *  uses api function searchItems()
 ***********************************************************/

function popup_searchItems()
{  
     var xpos = 50; 
     var ypos = 70;
     var pdiv = popupwindow(document.getElementById("anchor"), 
        ' <div><h1>'+_('Search station/object')+'</h1><div id="searchform"><form> '+
        _('Keywords (tags)')+ ': <br><div id="tags"></div> ' +
        _('Free text search') + ': <input type="text"  width="10" id="search" value="*"/> '+
        ' <input id="searchbutton" type="button"' +
            ' value="'+_('Search')+'" /> ' +
        '</form><br><div id="searchresult"></div></div></div>', xpos, ypos, null); 
     
     getTags(null, null, tagListCallback);
     $('#searchbutton').click( function(e) {
         e = (e)?e:((event)?event:null);
         e.cancelBubble = true; 
         if (e.stopPropagation) e.stopPropagation();
         searchItems( $('#search').val(), getTagArgs(), searchItemsCallback)                  
     });


    function getTagArgs()
    {
      var tags = "";
      $('div.taglist>input').each( function(i) {
        if ($(this).prop("checked")==true)
          tags = tags + (tags=="" ? "" : ",") + $(this).prop('id').substring(4);
      });
      return tags;
    }
    
    
    function tagListCallback(info)
    {
        if (info == null)
          return;
        $('#tags').html(info);
        
        $('div.taglist>input').change( function(e) {
           getTags(null, getTagArgs(), tagListCallback);
        });
    }
    
    
    function searchItemsCallback(info)
    {  
        if (info == null) 
           return; 

        var x = (isMobile ? document.getElementById('searchform') : 
                            document.getElementById('searchresult'));
        if (x != null) {            
            x.innerHTML = info;
            /* Remove and popup again to get it to add scrollbar correctly */
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



function popup_searchTags()
{
  fullPopupWindow('Search', server_url + 'srv/searchtag'+ '?lang='+language +
     (ident==null ? "" : '&objid='+ident), 360, 210);
}




/************************************************************************************
 * Popup window to search for map positions
 *  uses api functions doRefSearchLocal(), doRefSearchUtm and doRefSearchLatLong()
 ************************************************************************************/

function popup_refSearch()
{
   /* TODO: Mulighet for å skrive inn kartreferanse i maidenhead */
    var center = myKaMap.getCenter();
    var cref = new LatLng(center.lat, center.lon);
    uref = cref.toUTMRef(); 


   popupwindow(myKaMap.domObj, 
     '<h1>'+_('Show reference on map')+'</h1>' +
     '<form class="mapref">'+
          
     '<span class="sleftlab">MGRS ref: </span>' +
     '<div><input id="locx" type="text" size="3" maxlength="3">'+
     '<input id="locy" type="text" size="3" maxlength="3">&nbsp;'+
     '<input type="button" id="butt_mgrs"'+
     '   value="'+_('Find')+'">&nbsp;</div>'+
     
     '<hr><span class="sleftlab">UTM: </span>'+
     '<nobr><div><input id="utmz" type="text" size="2" maxlength="2" value="' +uref.lngZone+ '">' +
     '<input id="utmnz" type="text" size="1" maxlength="1" value="' +uref.latZone+ '">' +
     '&nbsp;&nbsp<input id="utmx" type="text" size="6" maxlength="6">'+
     '<input id="utmy" type="text" size="7" maxlength="7">&nbsp;'+
     
     '<input type="button" id="butt_utm"'+
     '   value="'+_('Find')+'" style="margin-right:3.5em">&nbsp;</div></nobr>' +
     
     '<hr><span class="sleftlab">LatLong: </span>' +
     '<nobr><div><input id="ll_Nd" type="text" size="2" maxlength="2">°&nbsp;'+
     '<input id="ll_Nm" type="text" size="6" maxlength="6">\'&nbsp;N&nbsp;&nbsp;'+
     '<input id="ll_Ed" type="text" size="2" maxlength="2">°&nbsp;' +
     '<input id="ll_Em" type="text" size="6" maxlength="6">\'&nbsp;E&nbsp;' +
     '<input type="button" id="butt_ll"'+
     '   value="'+_('Find')+'">&nbsp;</div></nobr><hr>'+
     '</form>' 
     
   , (isMobile? 20:50), (isMobile?53:70), false);
   
      autojump('utmz', 'utmnz');
      autojump('utmnz', 'utmx');
      autojump('utmx', 'utmy');
      autojump('locx', 'locy');
      autojump('ll_Nd', 'll_Nm');
      autojump('ll_Nm', 'll_Ed');
      autojump('ll_Ed', 'll_Em');
      
      $('#butt_mgrs').click( function() {
              doRefSearchLocal( $('#locx').val(), $('#locy').val() );  
           });
      
      $('#butt_utm').click( function() {
              doRefSearchUtm( $('#utmx').val(), $('#utmy').val(), $('#utmnz').val(), $('#utmz').val() );  
           });
      
      $('#butt_ll').click( function() {
              doRefSearchDM( $('#ll_Nd').val(), $('#ll_Nm').val(), $('#ll_Ed').val(), $('#ll_Em').val() );  
           }); 
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






var skNames = new statkartName(statkartName_url);


/********************************************************
 * popup window to search for place names in SK database
 ********************************************************/

function popup_searchNames()
{  
  var xpos = 50; 
  var ypos = 70;
  var pdiv = popupwindow(document.getElementById("anchor"), 
          ' <div><h1>'+_('Find Location Name (Kartverket)')+'</h1><div id="searchform"><form> '+
          ' Navn: <input type="text"  width="10" id="findname"/> '+
          ' <input id="searchbutton" type="button"' +
          ' value="'+_('Search')+'" />' +
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
       x.innerHTML = info;
       
       /* To allow scrollbar to be added */
       removePopup();
       setTimeout(function() { popup(document.getElementById("anchor"), pdiv, xpos, ypos, null);}, 1000); 
    } 
    
  }
}




/*******************************************************************************
 * popup info on a position on the map
 * based on pixel position on display
 *******************************************************************************/
function popup_posInfoPix(x, y)
{
  var coord = myKaMap.pixToGeo(x, y);
  popup_posInfo(new LatLng(coord[1], coord[0]));
}



/*******************************************************************************
 * popup info on a position on the map
 *******************************************************************************/
function popup_posInfoXY(x, y)
   { popup_posInfo( new LatLng(y, x) ); }



var wps = new statkartWPS(statkartWPS_url);

/*******************************************************************************
 * popup info on a position on the map
 * based on LatLong reference. 
 *******************************************************************************/

function popup_posInfo(llref, iconOnly)
{
    var sref = "" + llref.toUTMRef();
    var ustring = showUTMstring(sref); 

    var nPixPos = myKaMap.geoToPix(llref.lng, llref.lat);
    
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
      wps.doElevation(llref, function(wdata) {
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
       var m = w.appendChild(createItem(_('Add APRS object here'), 
            function () { popup_editObject(nPixPos[0], nPixPos[1]); menuMouseSelect();}));
       m.style.width = "12em";
    }
}


function popup_setLanguage()
{
   var xpos = 50; 
   var ypos = 70;
   var w = new PopupMenu('language');
   w.clear();
   w.add('Norsk', function() 
       { storage[uid+'.language'] = 'no'; 
         LANGUAGE('no');
         menuMouseSelect(); } );
   w.add('English', function() 
       { storage[uid+'.language'] = 'en'; 
         LANGUAGE('en');
         menuMouseSelect(); } );
   w.activate(document.getElementById("anchor"), xpos, ypos);
}


/**************************************************************
 * popup weather report from met.no 
 **************************************************************/

var wx = new WXreport(WXreport_url);

function popup_wxInfoPix(x, y) {
  var coord = myKaMap.pixToGeo(x, y);
  var ref = new LatLng(coord[1], coord[0]);
  popup_wxInfo(ref);
}



function popup_wxInfo(ref) {
  var nPixPos = myKaMap.geoToPix(ref.lng, ref.lat);
  
  var w = popupwindow(myKaMap.domObj, 
        '<img title="Kilde: Meteorologisk institutt (met.no)" src="images/met.gif" align="right">'+
        '<h3>Værmelding fra met.no</h3>' +
        '<div id="wxresult"></div>', 
         nPixPos[0], nPixPos[1], false);
                      
  wx.doTextReport(ref, function(wdata) {
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
