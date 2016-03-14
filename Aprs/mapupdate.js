
/*********** Websocket handler ********************************/

var _mapupdate_suspend = false;
var _mapupdate_retry = 0;


function mapupdate_init() {
   var loc = window.location, uri;
   uri =  (loc.protocol === "https:") ? "wss" : "ws";
   uri += "://" + loc.host + loc.pathname;
   uri += (tryAuth() ? 'ws/mapdata_sec' : 'ws/mapdata');
   websocket = new WebSocket(uri);
  
   
  websocket.onopen = function() { 
     OpenLayers.Console.info("Connected to server (for XML overlay).");
     setTimeout( function() { mapupdate_subscribe(); }, 1000);
  };
  
  websocket.onmessage = function(evt) { 
     if (!_mapupdate_suspend)
         myOverlay.applyXml(evt.data);
  };
  
  
  websocket.onclose = function(evt) {
     _mapupdate_retry++;
     if (_mapupdate_retry <= 3)
        setTimeout(function() {
           OpenLayers.Console.info("Attempt reconnect to server (for XML overlay).");
           mapupdate_init(); 
        }, 15000);
     else {
        _mapupdate_retry = 0;
        OpenLayers.Console.error("Lost connection to server (for XML overlay).");
        alert(_("ERROR: Lost connection to server"));
     }
  }
  
  
  websocket.onerror = function(evt) { 
     if (failedAuth()) {
        OpenLayers.Console.error("Failed to connect to server (for XML overlay).");
        alert(_("ERROR: Failed to connect to server"));
     }
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

