

/*
 * Uses global objects: myOverlay, myKaMap
 */ 

/*
 * Create a GPS tracker object that gets positions from 
 * the GPS and plots them on the map. 
 */

function GpsTracker ()
{
   this.gps_on = false; 
   this.my_point = null; 
   this.watchID = null; 
   this.speedDisplay = 0;
}   
   

GpsTracker.prototype.activate = function ()   
{
   var t = this; 
   var retry = 0;
   t.gps_on = true; 

   
   /*
    * Called when we get a new or updated position from GPS
    */
   function gps_onSuccess(position) {
     retry = 0;
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
     var uref_map = uref.toLatLng().toUTMRef('W', utmzone);
     myZoomToGeo(uref_map.easting, uref_map.northing, 0.2);
     
     /* Show speed and heading */
     if (t.speedDisplay > 0) {
       setStatus('<div id="speedDisplay">'
         +((false && position.coords.speed > 0.3)s ? '<div id="gpsheadd"><img id="gpsheading" src="images/ptr1.png"></div>' : '')  
         + speedHeading(position.coords) + '</div>');
       
      //   FIXME: Rotated arrow doesn't work. Not important. 
      //   var hd = new ImgRotate('gpsheading');
      //   hd.rotate(position.coords.heading);
     }
     else
        setStatus('&nbsp; GPS posisjon ok <br>' + uref + '&nbsp;/&nbsp;'+ speedHeading(position.coords));
     
     /* Show position on map */
     if (t.my_point == null) {
        t.my_point = myOverlay.addNewPoint('my_gps_position', uref_map.easting, uref_map.northing);  
        var icon = new kaXmlIcon();
        icon.setImage(t.my_point, "images/position.png", 60, 60); 
        t.my_point.addGraphic(icon);
        t.my_point.div.appendChild(icon.ldiv);  
        icon.setClass("gpsposition");
     }
     else
        t.my_point.setPosition(uref_map.easting, uref_map.northing);
     myKaMap.updateObjects();
   }
   
   
   
   function gps_onError(error) {
     if (t.watchID == null)
        return;
     if (error.code==PositionError.TIMEOUT)
        setStatus('&nbsp; venter på GPS...<br>');
     else if (error.code=PositionError.POSITION_UNAVAILABLE) 
     {
        if (retry++ >= 3) {
           navigator.geolocation.clearWatch(this.watchID);
           setTimeout(startWatch, 20000);
        }
        else {
           retry = 0;
           setStatus('&nbsp; Får ikke posisjon<br>');
           navigator.notification.alert ("FEIL: Posisjon er ikke tilgjengelig", null, 'PolaricDroid');
           t.deactivate();
        }
     }
     else {
        setStatus('&nbsp; GPS utilgjengelig<br>' + error.message);
        navigator.notification.alert ("FEIL: Ikke tilgang til GPS. Sjekk innstillinger.", null, 'PolaricDroid');
        t.deactivate();
     }
     
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
       if (t.speedDisplay==2)
            return '<span class="speed">'+Math.round(x.speed*1.94384449*10)/10+'</span> knop '+d;
       else
            return '<span class="speed">'+Math.round(x.speed*3.6)+'</span> km/h '+d;
   }
   
   
   function startWatch()
   { 
       t.watchID = navigator.geolocation.watchPosition(gps_onSuccess, gps_onError, 
          { timeout: 60000, enableHighAccuracy: true, maximumAge: 10000} ); 
   }
                
   
   if (t.watchID == null)
      startWatch();
   setStatus('&nbsp; GPS <u>på</u>slått');
}




GpsTracker.prototype.isActive = function ()
{
  return (this.watchID != null);
}



GpsTracker.prototype.deactivate = function ()
{
   this.gps_on = false; 
   myOverlay.removePoint('my_gps_position');
   this.my_point = null;
   navigator.geolocation.clearWatch(this.watchID);
   this.watchID = null;
   setStatus('&nbsp; GPS <u>av</u>slått');
   myKaMap.updateObjects();
}



GpsTracker.prototype.toggleSpeedDisplay = function ()
{
    this.speedDisplay = (this.speedDisplay + 1) % 3;
    if (this.speedDisplay==1) 
       setStatus('&nbsp; Vise <u>fart</u> (km/h): vent litt...');
    else if (this.speedDisplay==2)
       setStatus('&nbsp; Vise <u>fart</u> (knop): vent litt...');
    else if (this.gps_on)
       setStatus('&nbsp; GPS <u>på</u>slått');
    else
       setStatus('&nbsp; GPS <u>av</u>slått');
}