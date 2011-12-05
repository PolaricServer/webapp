
Proj4js.defs["EPSG:32633"] = "+proj=utm +zone=33 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";


function add_Gpx_Layer(name, url)
{
    var gpx_format = new OpenLayers.Format.GPX();
    var styleMap = new OpenLayers.StyleMap(OpenLayers.Util.applyDefaults({
         	  strokeColor: "blue",
         	  strokeWidth: 2,
         	  strokeOpacity: 0.8, 
         	  externalGraphic: "images/point.gif",
         	  graphicOpacity: 0.9,
         	  graphicWidth: 22,
         	  graphicHeight: 22,
         	  strokeDashstyle: "solid"},
              OpenLayers.Feature.Vector.style["default"]));

    var layer = new OpenLayers.Layer.Vector(name, {styleMap: styleMap});
    OpenLayers.loadURL(url, null, null, loadSuccess, loadFailure);
    layer.setVisibility(false);
    return layer; 
    
    /* A closure function to transform data */
    function loadSuccess(request) {
       var features = gpx_format.read(request.responseText);
       for(var i = 0; i<features.length;i++){
  	  features[i].geometry.transform(new OpenLayers.Projection('EPSG:4326'), 
	                                 new OpenLayers.Projection('EPSG:32633'));
       }
       layer.addFeatures(features);
    }
    
    function loadFailure(request) {
       alert("Kunne ikke lese GPX-fil...");
    }
}