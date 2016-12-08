/* 
 * Configuration file for polaric-webapp. This is actually javascript code.
 * 
 * Version 1.6 supports changing UTM projection for maps. 
 * Version 1.7 support mixing maps with different projections, languages and more..
 * 
 * For projections, you may need to add the EPSG definition, e.g. if you 
 * want to use UTM zone 35: 
 *
 * Proj4js.defs["EPSG:32635"] = "+proj=utm +zone=35 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";*
 *
 * If you change projection/zone you may need to update max_extent and you 
 * may need to update layers and mapcache.xml as well. 
 *
 */


/*
 * Language for user interface: Supported languages are: 
 *  'no' = Norwegian
 *   Default is English (just comment out the next line)
 * 
 * It is also possible so change the language by using the 
 * URL parameter 'lang'
 */
LANGUAGE('no');


/*
 * Base URL of server. Leave it empty if the server
 * and the js document are at the same location. 
 */ 
var server_url = '';



/* 
 * Default system projection. Currently we assume that this 
 * is a UTM projection.  
 */
var utm_projection = "EPSG:32633";



/*
 * Default map extents. Resolutions and number of zoom levels.
 * Can (probably) be overridden by the individual base layers.  
 */ 

var max_extent     = [-2500000, 3500000, 3045984, 9045984];
var max_resolution = 1354; 
var min_resolution = 0.6611328;
var max_zoomlevels = 12; 

var default_attribution = 'Kart: <a href="http://www.statkart.no">Statens kartverk</a>, <a href="http://www.statkart.no/nor/Land/Fagomrader/Geovekst/">Geovekst</a> og <a href="http://www.statkart.no/?module=Articles;action=Article.publicShow;ID=14194">kommuner</a>';


/*
 * Bacground color for maps
 */
var backgroundColor = '#A1C1C9';


/*
 * List of base layers. This is a fairly straightforward OpenLayers way
 * of setting up layers. Use the LAYER function to add a set of layers. This 
 * can be used more than once. 
 * 
 * The LAYERS function takes three arguments: 
 *    - if this is a base layer (boolean)
 *    - A predicate (a function returning a boolean value). This acts as a filter. 
 *      if evaluated to true the layers are shown in layer list. The predefined TRUE 
 *      always evaluates to true.
 *    - An array of layers. See OpenLayers documentation. 
 *
 * To add GPX vector layers, put the gpx files in directory /gpx and
 * use the function add_Gpx_Layer(name, file) to add them to the list like 
 * in the example below. 
 */


/* Polygon that draws a border around Norway */
var Norge = POLYGON( [
    {lat:58.979, lng:11.557}, {lat:58.692, lng:9.725},  {lat:57.819, lng:7.408},  {lat:58.911, lng:4.911}, 
    {lat:62.343, lng:4.428},  {lat:64.567, lng:9.962},  {lat:67.99,  lng:11.675}, {lat:70.029, lng:16.842}, 
    {lat:71.528, lng:26.154}, {lat:70.39,  lng:31.944}, {lat:69.19,  lng:29.1},   {lat:70.05,  lng:27.899}, 
    {lat:68.481, lng:24.854}, {lat:68.979, lng:21.04},  {lat:68.306, lng:20.021}, {lat:68.349, lng:18.581}, 
    {lat:64.618, lng:13.877}, {lat:64.414, lng:14.363}, {lat:63.957, lng:14.014}, {lat:63.963, lng:12.853},
    {lat:61.782, lng:12.287}, {lat:61.244, lng:12.971} 
]);


/* OpenStreetMap base layer */
LAYERS (true, TRUE, [
     new OpenLayers.Layer.OSM("OpenStreetMap", null, {gray: '0.1'})
]);


/* 
 * Base layers from the norwegian mapping authority (kartverket). Some of them 
 * go via local mapcache. Note the test (is_visible): These layers are visible 
 * if viewport includes norwegian territory.
 */
LAYERS (true, function() { return is_visible(Norge); }, [
      /* Kartverket Topo 2. Cached on localhost */
      new OpenLayers.Layer.TMS(
         "KV Topo2 (cache)", "/mapcache/tms/",
         { layername: 'kv_topo2cache', type: 'jpg' }
      ),
      /* Kartverket Grunnkart. Cached on localhost */
      new OpenLayers.Layer.TMS(
         "KV Grunnkart (cache)", "/mapcache/tms/",
         { layername: 'kv_grunnkart', type: 'jpg', gray: '0'}
      ),   
      /* Raster. Directly from Kartverket */
      new OpenLayers.Layer.WMS(
         "Kartverket Raster", "http://opencache.statkart.no/gatekeeper/gk/gk.open?",
         { layers: 'toporaster3',
           format: 'image/png' }
      ),
      /* Sea maps. Directly from Kartverket */
      new OpenLayers.Layer.WMS(
         "Kartverket Sjøkart", "http://opencache.statkart.no/gatekeeper/gk/gk.open?",
         { layers: 'sjo_hovedkart2',
           format: 'image/png' }
      )
 ]);


/* Overlay layer. UTM/MGRS Grid (from Kartverket WMS) */
LAYERS (false, TRUE, [  
       new OpenLayers.Layer.WMS(
         "UTM/MGRS Rutenett", "http://openwms.statkart.no/skwms1/wms.rutenett",
         { layers:'UTMrutenett',transparent: true },
         { isBaseLayer: false, singleTile: true, ratio: 1, visibility: false }
       )
 ]);



/* Overlay layer. Map sheets (from Kartverket WMS) */
LAYERS ( false, 
         function() { return is_visible(Norge) && projection() == utm_projection; },
[  
         new OpenLayers.Layer.WMS(
           "Kartblad", "http://wms.geonorge.no/skwms1/wms.kartblad",
           { layers:'Kartblad_WMS',transparent: true },
           { isBaseLayer: false, singleTile: true, ratio: 1, visibility: false }
         )
]);




/*
 * Menu of predefined map-extents.  
 * Extents are upper left corner (1) and lower right corner (2) in decimal degrees
 * [longitude-1, latitude-1, longitude-2, latitude-2] 
 */
var defaultView = 'default';
var mapViews = [
   { name: 'finnm',     title: 'Finnmark',        extent: [18.3575, 68.26,   32.4980, 71.8444] },
   { name: 'ntroms',    title: 'Nord-Troms',      extent: [16.7582, 68.8402, 23.4135, 70.4735] },
   { name: 'tromso',    title: 'Tromsø',          extent: [18.5793, 69.5524, 19.4027, 69.7525] },
   { name: 'mtroms',    title: 'Midt/sør-Troms',  extent: [15.1248, 68.2508, 21.4869, 69.8232] },
   { name: 'ofoten',    title: 'Ofoten/Lofoten',  extent: [12.1127, 67.7717, 18.3217, 69.239]  },
   { name: 'salten',    title: 'Salten',          extent: [11.3947, 66.5,    17.2634, 67.9832] },
   { name: 'helg',      title: 'Helgeland',       extent: [10.0569, 65.1156, 15.5983, 66.6494] },  
   { name: 'ntrond',    title: 'Nord-Trøndelag',  extent: [ 9.0436, 63.2859, 15.3995, 64.8541] },
   { name: 'strond',    title: 'Sør-Trøndelag',   extent: [ 7.3903, 62.0338, 13.5351, 63.6724] },
   { name: 'moreroms',  title: 'Møre og Romsdal', extent: [ 3.5993, 61.5234,  9.7916, 63.3084] },
   { name: 'sognf',     title: 'Sogn og fjordane',extent: [ 2.8448, 60.4411,  8.8474, 62.2549] },
   { name: 'hordal',    title: 'Hordaland',       extent: [ 3.1295, 59.3777,  8.9257, 61.1814] },
   { name: 'rogal',     title: 'Rogaland',        extent: [ 3.3536, 58.0768,  8.9212, 59.8724] },
   { name: 'agder',     title: 'Agder',           extent: [ 4.7145, 57.7071, 10.1809, 59.4536] },
   { name: 'tele',      title: 'Telemark',        extent: [ 7.4777, 58.7404, 10.2363, 59.5893] },
   { name: 'hardanger', title: 'Hardangervidda/Buskerud', extent: [ 6.4033, 59.3222, 12.0772, 61.0049] },
   { name: 'oslofj',    title: 'Østfold/Vestfold',extent: [ 7.8612, 58.8272, 13.3971, 60.4553] },
   { name: 'osloaker',  title: 'Oslo/Akershus',   extent: [ 9.3833, 59.3858, 12.161,  60.1985] },
   { name: 'hedopp',    title: 'Hedmark/Oppland', extent: [ 8.2261, 59.8479, 13.9201, 61.4599] },
   { name: 'default',   title: 'Utgangspunkt',    extent: [ -16.0421, 56.929, 43.2233, 67.989], hidden: true }
];


/* Filter menu. The actual filters are defined by aprsd in
 * /etc/polaric-aprsd/view.profiles. The name attribute refers to a profile-name. 
 * For non-public profiles, add attribute: restricted: 'true' 
 */

var filterViews = [
   { name: 'alle',   title: 'Alle / Alt' },
   { name: 'track',  title: 'Sporing 1' },
   { name: 'le',     title: 'Kun LE kall' }, 
   { name: 'infra',  title: 'Infrastruktur'},
   { name: 'ainfra', title: 'Aktiv Infrastr'},
   { name: 'moving', title: 'Bevegelige'}
];

/* View to be selected by default */
var defaultFilterView = 'track';


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
var statkartName_url = "http://ws.geonorge.no/AdresseWS/adresse/sok";



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
