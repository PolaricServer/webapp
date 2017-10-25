
/*********** Websocket handler ********************************/

var _mapupdate_suspend = false;
var _mapupdate_retry = 0;
var websocket = null; 


function mapupdate_init() {
   var loc = server_loc, uri;
   uri =  (loc.protocol === "https:") ? "wss" : "ws";
   uri += "://" + loc.host + loc.pathname;
   uri += 'ws/mapdata';
   websocket = new WebSocket(uri);
  
   
  websocket.onopen = function() { 
     OpenLayers.Console.info("Connected to server (for XML overlay).");
     setTimeout( function() { mapupdate_subscribe(); }, 1000);
     _mapupdate_retry = 0;
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
        }, 16000);
     else {
        _mapupdate_retry = 0;
        OpenLayers.Console.error("Lost connection to server (for XML overlay).");
        alert(_("ERROR: Lost connection to server"));
     }
  }
  
  
  websocket.onerror = function(evt) { 
     OpenLayers.Console.error("Failed to connect to server (for XML overlay).");
     alert(_("ERROR: Failed to connect to server"));
  };
}




function mapupdate_suspend(t) {
  _mapupdate_suspend = true; 
   setTimeout( function() {_mapupdate_suspend = false; }, t);
}


function mapupdate_close() {
  if (websocket && websocket != null)
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

