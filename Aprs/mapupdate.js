
/*********** Websocket handler ********************************/


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




function mapupdate_subscribe() {
  var ext = myKaMap.getGeoExtents();
  var flt = "";
  if (filterProfiles.selectedProf() != null)
     flt = filterProfiles.selectedProf();
  
  websocket.send('SUBSCRIBE,' + flt+',' + 
       roundDeg(ext[0])+ ',' + roundDeg(ext[1])+ ',' + roundDeg(ext[2])+ ',' + roundDeg(ext[3])+ ',' + currentScale);
}

