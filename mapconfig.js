/*
 * Base URL of server. Leave it empty if the server
 * and the js document are at the same location. 
 */ 
var server_url = '';

/* set to true to add map-layers from ka-map.
 * Metadata will be fetched with an AJAX call to the server.
 */
var use_kaMap_maps = true;


/* System projection.  
 */
var utm_projection = new OpenLayers.Projection("EPSG:32633");


/*
 * Bacground color for maps
 */
var backgroundColor = '#A1C1C9';


/* 
 * Options for the map (common to all layers) 
 */
 var mapOptions = {
     projection: new OpenLayers.Projection('EPSG:32633'),
     displayProjection: new OpenLayers.Projection('EPSG:32633'),
     numZoomLevels: 12,
     zoomMethod: null,
     maxExtent: new OpenLayers.Bounds(-2500000.0,3500000.0,3045984.0,9045984.0),
     maxResolution: 1354.0, 
     minResolution: 0.6611328, 
     units: "m",
     controls: [new OpenLayers.Control.Navigation(), new OpenLayers.Control.Attribution()]
 };

         

  
/* Attribution of Statens Kartverk */
 var _kv_attr = 'Kart: <a href="http://www.statkart.no">Statens kartverk</a>, <a href="http://www.statkart.no/nor/Land/Fagomrader/Geovekst/">Geovekst</a> og <a href="http://www.statkart.no/?module=Articles;action=Article.publicShow;ID=14194">kommuner</a>';


/*
 * List of base layers. This is a fairly straightforward OpenLayers way
 * of setting up layers. See OpenLayers documentation if you want hack this..
 *
 * To add GPX vector layers, put the gpx files in directory /gpx and
 * use the function add_Gpx_Layer(name, file) to add them to the list like 
 * in the example below. 
 */
 var baseLayers = [

    new OpenLayers.Layer.WMS(
             "Kartverket Topo2", "http://opencache.statkart.no/gatekeeper/gk/gk.open?",
             {  layers: 'topo2',
                format: 'image/png'},
             {  attribution: _kv_attr }
        ),    
    new OpenLayers.Layer.WMS(
             "Kartverket Raster", "http://opencache.statkart.no/gatekeeper/gk/gk.open?",
             {  layers: 'toporaster2',
                format: 'image/png'},
             {  attribution: _kv_attr }
        ),   
    new OpenLayers.Layer.WMS(
          "Kartverket Grunnkart", "http://opencache.statkart.no/gatekeeper/gk/gk.open?",
          {  layers: 'norges_grunnkart',
             format: 'image/png'},
          {  attribution: _kv_attr,
             gray: '0' }
        ),    
    new OpenLayers.Layer.WMS(
             "Kartverket Sjøkart", "http://opencache.statkart.no/gatekeeper/gk/gk.open?",
             {  layers: 'sjo_hovedkart2',
                format: 'image/png'},
             {  attribution: _kv_attr }
        ),
    new OpenLayers.Layer.WMS(
             "Kartverket Europakart", "http://opencache.statkart.no/gatekeeper/gk/gk.open?",
             {  layers: 'europa',
                format: 'image/png'},
             {  attribution: _kv_attr }
        )
    /* Example of how to add a GPX layer: Uncomment and modify the line below.. */
    /* , add_Gpx_Layer("Skarverennet", "gpx/Skarverennet.gpx")  */  
 ];       




/* Ka-map kart (lagres på server) kommer først i lista over kartlag, hvis du 
 * setter denne til true: 
 */
var kaMapFirst = false;

/*
 * Kartutsnitt-menyen. 
 * Extents er øverste venstre hjørne og nederste høyre hjørne i UTM sone 33
 * koordinater [x1, y1, x2, y2] 
 */
var getViewsFromKaMap = false; 
var defaultView = 'nord';
var mapViews = [
   { name: 'nord',      title: 'Nord Norge',     extent: [326971, 7372044, 1108229, 7975928] }, 
   { name: 'midt',      title: 'Midt Norge',     extent: [-65688, 6905591, 715569, 7509475] },
   { name: 'sor',       title: 'Sør Norge',      extent: [-253894, 6466218, 527363, 7070102] },
   { name: 'tromso',    title: 'Tromsø',         extent: [636159, 7722699, 672566, 7746300] },
   { name: 'harnar',    title: 'Harstad/Narvik', extent: [503725, 7567049, 677574, 7664557] },
   { name: 'helg',      title: 'Helgeland',      extent: [313207, 7292672, 514445, 7402007] }, 
   { name: 'trondheim', title: 'Trondheim',      extent: [163472, 6991305, 385358, 7143461] },
   { name: 'skarvet',   title: 'Hallingskarvet', extent: [78286, 6718318, 135323, 6750898] }, 
   { name: 'bergen',    title: 'Bergen',         extent: [-78428, 6690844, 32514, 6766922] },
   { name: 'stavanger', title: 'Stavanger',      extent: [-60738, 6544187, 32888, 6592940] },
   { name: 'oslofj',    title: 'Oslofjorden',    extent: [144516, 6529253, 366402, 6681408] }
];

/* Filter menyen */
var filterViews = [
   { name: 'alle',   title: 'Alle / Alt' },
   { name: 'track',  title: 'Sporing 1' },
   { name: 'le',     title: 'Kun LE kall' }, 
   { name: 'infra',  title: 'Infrastruktur'},
   { name: 'ainfra', title: 'Aktiv Infrastr'},
   { name: 'moving', title: 'Bevegelige'}
];
/* View to be selected by default */
var defaultFilterView = 'track2';


/* Set to true to enable SAR URL */
var sarUrl = false; 


/* Use WPS service from Statkart to get elevation data, 
 * for now, you have to set up a proxy for this on the server
 * with the same domain name as your service. It is VERY important 
 * to remove all Authorization headers from proxied requests, to 
 * avoid leaking authentication info. 
 */

var statkartWPS_enable = false;
var statkartWPS_url = "/aprs/wps";


var statkartName_enable = false; 
var statkartName_url = "/namesearch";



/* Use service from met.no go get weather forecasts.
 * For now, you have to set up a proxy for this on the server
 * with the same domain name as your service. It is VERY important 
 * to remove all Authorization headers from proxied requests, to 
 * avoid leaking authentication info. 
 * 
 * To activate this, you should know what you are doing!
 */

var WXreport_enable = false;
var WXreport_url = "/aprs/wxdata";
