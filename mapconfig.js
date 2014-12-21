/* 
 * Configuration file for polaric-webapp. This is actually javascript code.
 * 
 * Version 1.6 supports changing UTM projection for maps. This is experimental. 
 * If changing You may need to add the EPSG definition, e.g. if you want to use 
 * zone 35. 
 *
 * Proj4js.defs["EPSG:32635"] = "+proj=utm +zone=35 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";*
 *
 * If you change projection/zone you must update max_extent and you may need to 
 * update layers and mapcache.xml as well. 
 *
 */



/*
 * Base URL of server. Leave it empty if the server
 * and the js document are at the same location. 
 */ 
var server_url = '';


/* 
 * Default system projection. Currently we assume that this is a UTM projection. 
 * Please also state which UTM zone this is. 
 */
var utm_projection = "EPSG:32633";
var utm_zone       = 33;

/*
 * Default map extents. Resolutions and number of zoom levels.
 * Can (probably) be overridden by the individual base layers.  
 */ 


var max_extent     = [-2500000.0,3500000.0,3045984.0,9045984.0];
var max_resolution = 1354.0; 
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


/*
 * LAYERS ( base-layer (boolean), 
 *         predicate (function), 
 *         [ ... ] );
 */

var Danmark = POLYGON( [ 
{lat:54.528, lng:12.177}, {lat:54.453, lng:8.178},  {lat:56.948, lng:7.861},  {lat:57.986, lng:10.707}, 
{lat:56.171, lng:12.450}, {lat:55.868, lng:12.746}, {lat:54.951, lng:12.703}, {lat:54.432, lng:11.928} ] );

var Norge = POLYGON( [
{lat:58.979, lng:11.557}, {lat:58.692, lng:9.725},  {lat:57.819, lng:7.408},  {lat:58.911, lng:4.911}, 
{lat:62.343, lng:4.428},  {lat:64.567, lng:9.962},  {lat:67.99,  lng:11.675}, {lat:70.029, lng:16.842}, 
{lat:71.528, lng:26.154}, {lat:70.39,  lng:31.944}, {lat:69.19,  lng:29.1},   {lat:70.05,  lng:27.899}, 
{lat:68.481, lng:24.854}, {lat:68.979, lng:21.04},  {lat:68.306, lng:20.021}, {lat:68.349, lng:18.581}, 
{lat:64.618, lng:13.877}, {lat:64.414, lng:14.363}, {lat:63.957, lng:14.014}, {lat:63.963, lng:12.853},
{lat:61.782, lng:12.287}, {lat:61.244, lng:12.971} ] );



LAYERS (true, TRUE, [
   new OpenLayers.Layer.TMS(
      "KV Topo2/Europa (cache)", "https://aprs.no/mapcache/tms/",
       {  layername: 'kv_topo2eu', type: 'jpg' }
   ),
   new OpenLayers.Layer.OSM("OpenStreetMap", null, {gray: '0.1'})
]);



LAYERS (true, function() { return is_visible(Norge); },
        [
        new OpenLayers.Layer.TMS(
          "KV Grunnkart (cache)", "/mapcache/tms/",
                                 {  layername: 'kv_grunnkart', type: 'jpg', gray: '0'}
        ),

        
        new OpenLayers.Layer.WMS(
          "Kartverket Raster", "http://opencache.statkart.no/gatekeeper/gk/gk.open?",
          {  layers: 'toporaster2',
            format: 'image/png' }
        ),
        new OpenLayers.Layer.WMS(
          "Kartverket Sjøkart", "http://opencache.statkart.no/gatekeeper/gk/gk.open?",
          {  layers: 'sjo_hovedkart2',
            format: 'image/png' }
        )
        ] );



LAYERS (false, TRUE,
        [  
        new OpenLayers.Layer.WMS(
          "UTM/MGRS Rutenett", "http://openwms.statkart.no/skwms1/wms.rutenett",
          {layers:'UTMrutenett',transparent: true},
          {isBaseLayer: false, singleTile: true, ratio: 1, visibility: false}
        )
        ]);



LAYERS ( false, 
         function() { return is_visible(Norge) && projection() == utm_projection; },
         [  
         new OpenLayers.Layer.WMS(
           "Kartblad", "http://wms.geonorge.no/skwms1/wms.kartblad",
           {layers:'Kartblad_WMS',transparent: true},
           {isBaseLayer: false,singleTile: true, ratio: 1, visibility: false}
         ), 
         new OpenLayers.Layer.WMS(
           "Naturvernområder (DN)", "http://arcgisproxy.dirnat.no/arcgis/services/vern/MapServer/WmsServer",
                                  {layers:'naturvern_klasser_omrade',transparent: true},
                                  {isBaseLayer: false, singleTile: true, ratio: 1, visibility: false}
         )
         ]);



LAYERS ( true, 
         function()  { return scale() < 1000000 && is_visible(Danmark); }, 
         [
         new OpenLayers.Layer.TMS(
           "Danmark (cache)", "https://aprs.no/mapcache/tms/",
                                  { layername: 'danmark', type: 'jpg', gray: '0.25'}
         ),
         new OpenLayers.Layer.TMS(
           "Danmark Topo(cache)", "https://aprs.no/mapcache/tms/",
                                  { layername: 'danmark_topo', type: 'jpg'}
         )
         ] );




/*
 * Kartutsnitt-menyen. 
 * Extents er øverste venstre hjørne og nederste høyre hjørne i UTM sone 33
 * koordinater [x1, y1, x2, y2] 
 */
var defaultView = 'default';
var mapViews = [
{ name: 'finnm',     title: 'Finnmark',        extent: [18.3575, 68.26,   32.4980, 71.8444] },
{ name: 'ntroms',    title: 'Nord-Troms',      extent: [16.7582, 68.8402, 23.4135, 70.4735] },
{ name: 'tromso',    title: 'Tromsø',          extent: [18.5793, 69.5524, 19.4027, 69.7525] },
{ name: 'mtroms',    title: 'Midt/sør-Troms',  extent: [15.1248, 68.2508, 21.4869, 69.8232] },
{ name: 'ofoten',    title: 'Ofoten/Lofoten',  extent: [12.1127, 67.7717, 18.3217, 69.239] },
{ name: 'salten',    title: 'Salten',          extent: [11.3947, 66.5,    17.2634, 67.9832] },
{ name: 'helg',      title: 'Helgeland',       extent: [10.0569, 65.1156, 15.5983, 66.6494] },  
{ name: 'ntrond',    title: 'Nord-Trøndelag',  extent: [186099, 7040742, 465531, 7223871] },
{ name: 'strond',    title: 'Sør-Trøndelag',   extent: [124238, 6913382, 373713, 7073662] },
{ name: 'moreroms',  title: 'Møre og Romsdal', extent: [-2868,  6893749, 246606, 7054029] },
{ name: 'sognf',     title: 'Sogn og fjordane',extent: [-84277, 6747855, 165196, 6908135] },
{ name: 'hordal',    title: 'Hordaland',       extent: [-85972, 6631073, 163502, 6791353] },
{ name: 'rogal',     title: 'Rogaland',        extent: [-113727, 6497704, 135747, 6657983] },
{ name: 'agder',     title: 'Agder',           extent: [-65492, 6418664, 183981, 6578944] },
{ name: 'tele',      title: 'Telemark',        extent: [43250, 6520468, 292724, 6680748] },
{ name: 'hardanger', title: 'Hardangervidda/Buskerud', extent: [-10571, 6614740, 238902, 6775020] },
{ name: 'oslofj',    title: 'Østfold/Vestfold',extent: [196589,6544205,321326,6624345] },
{ name: 'osloaker',  title: 'Oslo/Akershus',   extent: [196009, 6607700, 335725, 6699264] },
{ name: 'hedopp',    title: 'Hedmark/Oppland', extent: [134551, 6731607, 384025, 6891887] },
{ name: 'default',   title: 'Utgangspunkt',    extent: [-207404, 6520269, 949709, 7188432], hidden: true }
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



/* Use service from met.no go get weather forecasts.
 * For now, you have to set up a proxy for this on the server
 * with the same domain name as your service. It is VERY important 
 * to remove all Authorization headers from proxied requests, to 
 * avoid leaking authentication info. 
 * 
 * To activate this, you should know what you are doing!
 */

var WXreport_enable = true;
var WXreport_url = "/aprs/wxdata";
