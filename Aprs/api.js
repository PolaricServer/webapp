 
 
 /****************************************************************** 
  * Set up a function to listen to messages from other frames 
  ******************************************************************/
 var client = 0;
 
 window.onmessage = function(e)  
 {   
   e = (e)?e:((event)?event:null);
   
   var args = e.data.split("##");
   var op = args[0].split("#");
   
   if (op[0] == "labelUp")
     labelStyle.next();
   else if (op[0] == "labelDown")
     labelStyle.previous();
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
   else if (op[0] == "gotoPos") {
      gotoPos(args[1], args[2]);
   }
   else if (op[0] == "gotoUtm") {
     var zz = args[1].substring(0,2);
     var nz = args[1].substring(2,3);
     doRefSearchUtm(args[2], args[3], nz, zz, true)
   }
   else if (op[0] == "findItem")
     findItem(args[1], parseBool(args[2]));
   else if (op[0] == "searchItems")
     searchItems(args[1], function(result) {
       e.source.postMessage(args[0]+"##"+result, e.origin);
     });
   else if (op[0] == "searchNames")
     skNames.doSearch(args[1], function(result) {
       e.source.postMessage(args[0]+"##"+result, e.origin); 
     });
   else if (op[0] == "xmlPoints")
     getXmlPoints(function(result) {
       e.source.postMessage(args[0]+"##"+result, e.origin);
     });
   else if (op[0] == "selectMap")
     myKaMap.selectMap(args[1]);
   else if (op[0] == "selectBaseLayer")
     myKaMap.selectBaseLayer(args[1]);
   else if (op[0] == "selectProfile") 
     filterProfiles.selectProfile(args[1]);
         
   else if (op[0] == "_subscribe") {
      var event = args[1];
      if (event=='XMLOVERLAY_LOAD') {
         client = (client + 1) % 100000;
         var cl = client;
         var orig = e.origin;
         var src = e.source;
         myOverlay.registerForEvent(XMLOVERLAY_LOAD, null, function() 
           { src.postMessage("EVENT#"+cl, orig); });      
         e.source.postMessage(args[0]+"##"+cl, e.origin);
      } 
      if (event=='MAP_EXTENTS_CHANGED') {
         client = (client + 1) % 100000;
         var cl = client;
         var orig = e.origin;
         var src = e.source;
         myKaMap.registerForEvent(KAMAP_EXTENTS_CHANGED, null, function() 
           { src.postMessage("EVENT#"+cl, orig); });      
         e.source.postMessage(args[0]+"##"+cl, e.origin);
      }
   } 
   
   
  function parseBool(x) {
      return (x=='T' || x == 't' || x == 'true')
  }   
   
 } 
 
 
 
 function getXmlPoints(cb)
 {
    var tb = '<table>';
    for (var i=0; i < myOverlay.ovrObjects.length; i++) {
      var x = myOverlay.ovrObjects[i];
      
      if (x != null)
        tb += '<tr><td onclick="findItem(\''+ x.pid +'\',true);">'+ 
           (x.pid.substring(0,6)!='__sign' ?  x.pid : '') + 
           '</td><td>'+ x.title + '</td></tr>'
    }
    tb += '</table>';
    cb(tb);
 }
 
 
 
 
 /**************************************************************************************
  * findStation - Locate an item and zoom the map to display its location.
  *    ident - the callsign/ident
  *    showInfo - Pop up an info window on top of the map. 
  **************************************************************************************/
 
 function findItem(ident, showInfo)
 {   
   /* AJA(X) call to find station */ 
   call(server_url + "srv/finditem?ajax=true&lang="+language+"&id="+ident, null, findItemCallback, false); 
   if (!showInfo)
      showInfo = false;
   
   
   function findItemCallback(info)
   {
      if (info == null)
         return; 
     
      /* The returned info should be three tokens delimited by commas: 
       * an id (string) and x and y coordinates (number)
       */
      var args = info.split(/\s*,\s*/g);
      if (args == null || args.length < 3)
         return;
      var x = parseFloat(args[1]);
      var y = parseFloat(args[2]);
      if (isNaN(x) || isNaN(y))
         return;
      myKaMap.zoomTo(x, y);
      removePopup();
      if (showInfo) 
         setTimeout(function() { showStationInfoGeo(args[0], false, x,  y );}, 1400);
      setTimeout(function() { 
         var x = myOverlay.getPointObject(args[0]);
         if (x!=null) x.moveToFront();     
      }, 3500);   
   }
 }
 
 
 
 
 
 /*************************************************************************************
  * Zoom to pos and show marker there 
  *    lat, long (string representation)
  *************************************************************************************/
 
 function gotoPos(lng, lat, hide)
 {    
    removePopup();
    doRefSearch(new LatLng(parseFloat(lat), parseFloat(lng)), hide);
 }
 
 
 
 /**************************************************************************************
  * doRefSearchLocal - Move map to a MGRS location
  **************************************************************************************/
 
 function doRefSearchLocal(ax, ay)
 {   
    removePopup();
    var x = parseInt(ax, 10);
    var y = parseInt(ay, 10);
    if (isNaN(x) || isNaN(y))
      return;
    
    /* find center of map */
    var center = myKaMap.getCenter();
    var ref = new LatLng(center.lat, center.lon); 
    var cref = ref.toUTMRef();
    
    /* Replace part of the UTM reference with arguments */
    var bx = Math.floor(cref.easting  / 100000) * 100000;
    var by = Math.floor(cref.northing / 100000) * 100000; 
    var uref = new UTMRef(bx + x * 100,  by + y * 100, cref.latZone, cref.lngZone); 
 
    /* TODO: We should actually try to show a 100x100m area */
    doRefSearch(uref.toLatLng());
 }
 

 
 
 /**************************************************************************************
  * doRefSearchDM - Move map to a specific location
  *    nd, nm, ed, em - coordinates in LatLong projection
  **************************************************************************************/
 // FIXME : order -> lon, lat
 function doRefSearchDM(nd, nm, ed, em)
 {  
   removePopup();
   var yd = parseInt(nd, 10);
   var ym = parseFloat(nm);
   var xd = parseInt(ed, 10);
   var xm = parseFloat(em);
   var ref = new LatLng(yd+ym/60, xd+xm/60);
   doRefSearch(ref);
 }
 
 
 
 /**************************************************************************************
  * doRefSearchUtm - Move map to a specific location
  *    ax, ay - coordinates in UTM projection
  *    nz, zz - UTM zone
  *    hide - 
  **************************************************************************************/
 
 function doRefSearchUtm(ax, ay, nz, zz, hide)
 {
   removePopup();
   var x = parseInt(ax, 10);
   var y = parseInt(ay, 10);
   var z = parseInt(zz, 10);
   if (isNaN(x) || isNaN(y) || isNaN(z))
     return;
   var uref = new UTMRef(x, y, nz, z);
   var ref = uref.toLatLng();
   doRefSearch(ref, hide);
 }
 
 
 function doRefSearch(ref, hide) {
   myKaMap.zoomTo(ref.lng, ref.lat);
   setTimeout( function() { popup_posInfo(ref, hide);}, 1500 );
 }
 
 
 
 
 /**************************************************************************************
  * searchStationsCall - Search items based on identifier or comment fields
  *    filt - Some text to match. Wildcards at beginning or end are allowed
  *    cb - callback function to receive the result. 
  * 
  *  The result will be text representation of a HTML table
  **************************************************************************************/
 
 function searchItems(filt, tags, cb)
 {
   call(server_url + "srv/search?ajax=true&lang="+language+
     (filt!=null && filt != '' ? '&srch='+filt : '') + 
     (tags!=null && filt != '' ? '&tags='+tags : '') +
     (isMobile==true?"&mobile=true":""), null, cb, false );
 }
 

 function getTags(item, tags, cb)
 {
   call(server_url + "srv/tags?ajax=true&lang="+language +
    (item!=null?'&item='+item : '') +
    (tags!=null?'&tags='+tags : '') +
    (isMobile==true?'&mobile=true':''), null, cb, false );
 }
 
 
 
 