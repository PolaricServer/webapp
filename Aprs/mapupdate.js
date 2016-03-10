
/*********** Websocket handler ********************************/

var _mapupdate_suspend = false; 


function mapupdate_init() {
   var loc = window.location, uri;
   uri =  (loc.protocol === "https:") ? "wss" : "ws";
   uri += "://" + loc.host + loc.pathname;
   uri += (tryAuth() ? 'ws/mapdata_sec' : 'ws/mapdata');
   websocket = new WebSocket(uri);
  
   
  websocket.onopen = function() { 
     OpenLayers.Console.info("Websocket for XML overlay opened.");
  };
  
  websocket.onmessage = function(evt) { 
     if (!_mapupdate_suspend)
         myOverlay.applyXml(evt.data);
  };
  
  websocket.onerror = function(evt) { 
     if (failedAuth()) 
        alert(_("ERROR: Failed to connect to server using websocket"));
     else {
        failAuth();
        mapupdate_init();
     }
  };
}


function mapupdate_suspend(t) {
  _mapupdate_suspend = true; 
   setTimeout( function() {_mapupdate_suspend = false; }, t);
}


function mapupdate_close() {
  websocket.close();
}


function mapupdate_subscribe() {
  _mapupdate_suspend = false; 
  var ext = myKaMap.getGeoExtents();
  var flt = "";
  if (filterProfiles.selectedProf() != null)
     flt = filterProfiles.selectedProf();
  
  websocket.send('SUBSCRIBE,' + flt+',' + 
       roundDeg(ext[0])+ ',' + roundDeg(ext[1])+ ',' + roundDeg(ext[2])+ ',' + roundDeg(ext[3])+ ',' + currentScale);
}

