/* 
 * Seems like we need to define projections explicitly. 
 * Alternatively, Openlayers may be set up to query this information online (??)
 *
 * FIXME: Need to investigate this more. Put definitions in a separate file?  
 */
Proj4js.defs["EPSG:32633"] = "+proj=utm +zone=33 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
Proj4js.defs["EPSG:32635"] = "+proj=utm +zone=35 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";



/*
 * Base URL of server. Leave it empty if the server
 * and the js document are at the same location. 
 */ 
var server_url = '';


/* System projection.  
 */
var utm_projection = new OpenLayers.Projection("EPSG:32633");
var utm_zone = 33;

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
             "KV Topo2/Europa (cache)", "http://localhost/mapcache?",
             {  layers: 'kv_topo2',
                format: 'image/jpeg'},
             {  attribution: _kv_attr }
        ),      
    new OpenLayers.Layer.WMS(
            "KV Grunnkart (cache)", "http://localhost/mapcache?",
            {  layers: 'kv_grunnkart',
               format: 'image/jpeg'},
            {  attribution: _kv_attr,
               gray: '0' }
        ),    
    new OpenLayers.Layer.WMS(
          "Kartverket Raster", "http://opencache.statkart.no/gatekeeper/gk/gk.open?",
          {  layers: 'toporaster2',
             format: 'image/png'},
          {  attribution: _kv_attr }
        ),                  
    new OpenLayers.Layer.WMS(
             "Kartverket Sjøkart", "http://opencache.statkart.no/gatekeeper/gk/gk.open?",
             {  layers: 'sjo_hovedkart2',
                format: 'image/png'},
             {  attribution: _kv_attr }
        )
    /* Example of how to add a GPX layer: Uncomment and modify the line below.. */
    /* , add_Gpx_Layer("Skarverennet", "gpx/Skarverennet.gpx")  */  
 ];       



/*
 * Kartutsnitt-menyen. 
 * Extents er øverste venstre hjørne og nederste høyre hjørne i UTM sone 33
 * koordinater [x1, y1, x2, y2] 
 */
var defaultView = 'default';
var mapViews = [
   { name: 'finnm',     title: 'Finnmark',        extent: [647979, 7649450, 1146928, 7970009] },
   { name: 'ntroms',    title: 'Nord-Troms',      extent: [554641,7639041,809193,7822170] },
   { name: 'tromso',    title: 'Tromsø',          extent: [636159, 7722699, 672566, 7746300] },
   { name: 'mtroms',    title: 'Midt/sør-Troms',  extent: [576304, 7606502, 701041, 7686642] },
   { name: 'ofoten',    title: 'Ofoten/Lofoten',  extent: [408367, 7505452, 662919, 7688580] },
   { name: 'salten',    title: 'Salten',          extent: [441921, 7409285, 569197, 7500849] },
   { name: 'helg',      title: 'Helgeland',       extent: [289088, 7223533, 543640, 7406661] },  
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

var WXreport_enable = false;
var WXreport_url = "/aprs/wxdata";
