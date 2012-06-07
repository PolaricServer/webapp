

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

   /*
    * Called when we get a new position from GPS
    */
   function gps_onSuccess(position) {
     if (position.coords.accuracy > 60) {
        if (this.my_point != null) {
           this.my_point.removeFromMap();
           this.my_point = null;
        }
        geopos.innerHTML = '&nbsp; GPS upresis posisjon ('+position.coords.accuracy+' m)';
        return;
     }
        
     var ll = new LatLng(position.coords.latitude, position.coords.longitude);
     var uref = ll.toUTMRef();
     var uref_map = uref.toLatLng().toUTMRef(utmnzone, utmzone);
     myZoomToGeo(uref_map.easting, uref_map.northing, 0.2);
     geopos.innerHTML = '&nbsp; GPS posisjon ok <br>' + uref + '&nbsp;/&nbsp;'+ speedHeading(position.coords);
     
     if (this.my_point == null) {
        this.my_point = myOverlay.addNewPoint('my_gps_position', uref_map.easting, uref_map.northing);  
        var t = new kaXmlIcon();
        t.setImage(this.my_point, "images/position.png", 54, 54); 
        this.my_point.addGraphic(t);
        this.my_point.div.appendChild(t.ldiv);  
     }
     else
        this.my_point.setPosition(uref_map.easting, uref_map.northing);
     myKaMap.updateObjects();
   }
   
   
   function gps_onError(error) {
      geopos.innerHTML = '&nbsp; GPS feil<br>' + error.message;
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
   geopos.innerHTML = '&nbsp; GPS <u>på</u>slått';
}




GpsTracker.prototype.deactivate = function ()
{
   myOverlay.removePoint('my_gps_position');
   this.my_point = null;
   navigator.geolocation.clearWatch(this.watchID);
   geopos.innerHTML = '&nbsp; GPS <u>av</u>slått';
   
}


// 