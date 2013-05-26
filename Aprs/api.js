 
 
 /****************************************************************** 
  * Set up a function to listen to messages from other frames 
  ******************************************************************/
 
 window.onmessage = function(e)  
 {   
   e = (e)?e:((event)?event:null);
   
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
     doRefSearchUtm(args[2], args[3], nz, zz, true)
   }
   else if (op[0] == "findItem")
     findStation(args[1]);
   else if (op[0] == "searchItems")
     searchStationsCall(args[1], function(result) {
       e.source.postMessage(args[0]+"##"+result, e.origin);
     });
   else if (op[0] == "searchNames")
     skNames.doSearch(args[1], function(result) {
       e.source.postMessage(args[0]+"##"+result, e.origin); 
     });
   
   else if (op[0] == "selectMap")
     myKaMap.selectMap(args[1]);
   else if (op[0] == "selectBaseLayer")
     myKaMap.selectBaseLayer(args[1]);
 } 
 
 
 
 
 
 
 /**************************************************************************************
  * findStation - Locate an item and zoom the map to display its location.
  *    ident - the callsign/ident
  *    showInfo - Pop up an info window on top of the map. 
  **************************************************************************************/
 
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
 
 
 
 
 
 
 /**************************************************************************************
  * doRefSearchLatLong - Move map to a specific location
  *    nd, nm, ed, em - coordinates in LatLong projection
  **************************************************************************************/
 
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
   _doRefSearchUtm(uref, hide);
 }
 
 
 function _doRefSearchUtm(uref, hide) {
   /* This is a hack, but the coordinates need to be in the same zone as the map */
   var uref_map = uref.toLatLng().toUTMRef(this.utmnzone, this.utmzone);
   myKaMap.zoomTo(uref_map.easting, uref_map.northing);
   setTimeout( function() { showPosInfoUtm(uref_map, hide);}, 1500 );
 }
 
 
 
 /**************************************************************************************
  * searchStationsCall - Search items based on identifier or comment fields
  *    filt - Some text to match. Wildcards at beginning or end are allowed
  *    cb - callback function to receive the result. 
  * 
  *  The result will be text representation of a HTML table
  **************************************************************************************/
 
 function searchStationsCall(filt, cb)
 {
   call(server_url + "srv/search?ajax=true&filter="+
   filt+(isMobile==true?"&mobile=true":""), null, cb, false );
 }
 