

/*
 * Uses global objects: myOverlay, myKaMap
 */ 

/*
 * Create a GPS tracker object that gets positions from 
 * the GPS and plots them on the map. 
 */

function GpsTracker ()
{
   this.my_point = null; 
   this.watchID = null; 
}   
   

GpsTracker.prototype.activate = function ()   
{
   var t = this; 
   
   /*
    * Called when we get a new position from GPS
    */
   function gps_onSuccess(position) {
     if (position.coords.accuracy > 60) {
        if (t.my_point != null) {
           t.my_point.removeFromMap();
           t.my_point = null;
        }
        setStatus('&nbsp; GPS upresis posisjon ('+position.coords.accuracy+' m)');
        return;
     }
        
     var ll = new LatLng(position.coords.latitude, position.coords.longitude);
     var uref = ll.toUTMRef();
     var uref_map = uref.toLatLng().toUTMRef(utmnzone, utmzone);
     myZoomToGeo(uref_map.easting, uref_map.northing, 0.2);
     setStatus('&nbsp; GPS posisjon ok <br>' + uref + '&nbsp;/&nbsp;'+ speedHeading(position.coords));
     
     if (t.my_point == null) {
        t.my_point = myOverlay.addNewPoint('my_gps_position', uref_map.easting, uref_map.northing);  
        var icon = new kaXmlIcon();
        icon.setImage(this.my_point, "images/position.png", 54, 54); 
        t.my_point.addGraphic(icon);
        t.my_point.div.appendChild(icon.ldiv);  
     }
     else
        t.my_point.setPosition(uref_map.easting, uref_map.northing);
     myKaMap.updateObjects();
   }
   
   
   function gps_onError(error) {
      setStatus('&nbsp; GPS feil<br>' + error.message);
      navigator.notification.alert ("ERROR:"+error.message, null, 'PolaricDroid');
   }
   
   function speedHeading(x)
   {
       var d="";
       if (x.heading < 22 || x.heading > 337) d = "N";
       else if (x.heading < 67) d = "NE";
       else if (x.heading < 112) d = "E";
       else if (x.heading < 157) d = "SE";
       else if (x.heading < 202) d = "S";
       else if (x.heading < 247) d = "SW";
       else if (x.heading < 292) d = "W"; 
       else d = "NW";
       return Math.round(x.speed*3.6)+" km/h "+d;
   }
   
   
   
   this.watchID = navigator.geolocation.watchPosition(gps_onSuccess, gps_onError, 
       { timeout: 240000, enableHighAccuracy: true, maximumAge: 10000} );
   setStatus('&nbsp; GPS <u>på</u>slått');
}




GpsTracker.prototype.deactivate = function ()
{
   myOverlay.removePoint('my_gps_position');
   this.my_point = null;
   navigator.geolocation.clearWatch(this.watchID);
   setStatus('&nbsp; GPS <u>av</u>slått');
   myKaMap.updateObjects();
}
