
var myKaMap = null;
var myKaNavigator = null;
var myKaQuery   = null;
var myScalebar  = null;
var queryParams = null;
var myKaRuler   = null; 
var objectClickable = false; 
var myKaRubberZoom = null;
var myKaTracker = null;
var initialized = false;
var win1 = null;
var eventz = null; 

// FIXME: Not necessary to duplicate? 
var utmzone = utm_zone; 

var clientses = 0;
var geopos;
var isOpera = _BrowserIdent_isOpera();
var isIframe = false;
var isMobile = false;
var isMobileApp = false;
var storage = null;
var ses_storage = null;
var uid = null;

var myCoordinates = myOverlay = myInterval = null;
var filterProfiles = null; 



function myOnLoad_iframe() {
    isIframe = true; 
    startUp();
    var d = document.getElementById('refToggler');
    toggleReference(d); 
}


function myOnLoad() {
  startUp();
}


function myOnLoad_mobile() {
  isMobile = true; 
  startUp();
  var d = document.getElementById('refToggler');
  toggleReference(d); 
}


function startUp() {
    var szMap = getQueryParam('map');   
    var szExtents = getQueryParam('extents');
    var szCPS = getQueryParam('cps');
    
    /* Initialize kaMap and related tools */
    initDHTMLAPI()
    
    myKaMap = new kaMap( 'PolaricVP' );
    myKaRuler = new myKaRuler(myKaMap);       
    myKaQuery = new kaQuery( myKaMap, KAMAP_POINT_QUERY ); 
    myKaRubberZoom = new kaRubberZoom( myKaMap );
    myKaTracker = new kaMouseTracker(myKaMap);
    myKaTracker.activate();
    myKaNavigator = new kaNavigator(myKaMap);
    myKaNavigator.activate();
    
    myScalebar = new ScaleBar(1);
    myScalebar.divisions = 3;
    myScalebar.subdivisions = 2;
    myScalebar.minWidth = 150;
    myScalebar.maxWidth = 250;
    myScalebar.place('scalebar');
    
    
    /* Register handlers for KaMap events */
    myKaMap.registerForEvent( KAMAP_MAP_INITIALIZED, null, myMapInitialized ); 
    myKaMap.registerForEvent( KAMAP_ERROR, null, myMapError );
    myKaMap.registerForEvent( KAMAP_INITIALIZED, null, myInitialized );  
    myKaMap.registerForEvent( KAMAP_SCALE_CHANGED, null, myScaleChanged );
    myKaMap.registerForEvent( KAMAP_EXTENTS_CHANGED, null, myExtentChanged );
    myKaMap.registerForEvent( KAMAP_LAYERS_CHANGED, null, myLayersChanged );
    myKaMap.registerForEvent( KAMAP_LAYER_STATUS_CHANGED, null, myLayersChanged );
    myKaMap.registerForEvent( KAMAP_QUERY, null, myQuery );
    myKaMap.registerForEvent( KAMAP_MAP_CLICKED, null, myMapClicked );
    if (!isMobileApp)
       myKaMap.registerForEvent( KAMAP_MOUSE_TRACKER, null, myMouseMoved );
    myKaMap.registerForEvent( KAMAP_MOVE_START, null, function() 
    {    if (myOverlay != null) 
                myOverlay.removePointExcept("my_.*"); 
     } );

  /* Dummy storage object for old browsers that do not 
     support it */
    storage = window.localStorage;
    if (storage == null) {
        storage = {
            getItem: function(x) {return null; },
            removeItem: function(x) {return null; },
            setItem: function(x,y) {return null; }
        };
    }   
    
    ses_storage = window.sessionStorage;   
    if (ses_storage == null) {
      ses_storage = {
        getItem: function(x) {return null; },
        removeItem: function(x) {return null; },
        setItem: function(x,y) {return null; }
      };
    }
    setSesStorage(ses_storage);  
    if (isMobileApp)
       getViewportRes(); 
    
    myKaMap.initialize( szMap, szExtents, szCPS );
    geopos = document.getElementById('geoPosition');
    window.onresize=redrawPage;
    myKaMap.drawPage(); 
    
    function redrawPage()
       {  var x = myKaMap; x.drawPage(); }
}


/* 
 * Event handler  (KaMap callback)
 * at this point, ka-Map! knows what map files are available and we have
 * access to them. But it has not rendered the map yet. We need to select the
 * baselayer before rendering, since otherwise maps will be loaded 
 * unneccessarily. 
 */
var permalink = false;
var args = null;
function myMapInitialized() { 
    var qstring = qstring = window.location.href;
    qstring = qstring.substring(qstring.indexOf('?')+1, qstring.length);
    
    /* Get arguments */
    args = new Object();
    var pairs = qstring.split("&");
    for(var i = 0; i < pairs.length; i++) {
        var pos = pairs[i].indexOf('=');
        if (pos == -1) continue;
        var argname = pairs[i].substring(0,pos);
        var value = pairs[i].substring(pos+1);
        args[argname] = unescape(value); 
    }
    
    uid = args['uid']; 
    if (uid==null)
      uid = "polaric"; 
    else uid = "polaric."+uid;
    init_labelStyle(storage, uid);
    OpenLayers.Console.info("UID=", uid);
    
    permalink = (qstring.length >= 2 && qstring.match(/.*zoom\=.*/) && qstring.match(/.*lat\=.*/));
    if (!permalink) {
         var blayer = storage[uid+'.baselayer'];
         if (blayer != null)
            myKaMap.setBaseLayerId(blayer);
    }
};



/* Event handler  (KaMap callback) */
function myMapError(msg) {
    alert(msg);
}



/* 
 * Event handler (KaMap callback)
 * At this point ka-Map! has rendered the map. Since OL does not 
 * handle zoom level before rendering (I think this is a bug in OL), 
 * we have to separate this out. 
 */
var ststate = null;
function myInitialized() { 
    sar_key = storage['polaric.sarkey'];
    var view = null;
    if (view == null)
       view = args['view'];
    if (view == null)
       view = defaultView; 
    
    if (!permalink)  {
         var ext0 = storage[uid+'.extents.0'];
         var ext1 = storage[uid+'.extents.1'];
         var ext2 = storage[uid+'.extents.2'];
         var ext3 = storage[uid+'.extents.3'];
         if (ext0 != null) {
            myKaMap.zoomToExtents(parseFloat(ext0), parseFloat(ext1), parseFloat(ext2), parseFloat(ext3));
            myKaMap.selectMap(view, true); 
         }
         else
            myKaMap.selectMap(view, false);
    }
    

    /* Set up a callback for map-area context-menu */
    var aMaps = myKaMap.getMaps();
    ctxtMenu.addCallback('AREASELECT', function (m) {

      for (var i in aMaps) 
         if (aMaps[i] && aMaps[i].name && aMaps[i].name.length > 1 && !aMaps[i].hidden)
            m.add(aMaps[i].title, function(x) { myKaMap.selectMap(x, false); }, aMaps[i].name );
      
    });
    addContextMenu('areaSelect', 'AREASELECT');
 
    
    /* Set up XML overlay */
    if (myOverlay == null)  
        myOverlay = new kaXmlOverlay( myKaMap, 1200 );
    myOverlay.registerForEvent(XMLOVERLAY_ERROR, null, postLoadXml_Fail);
    myOverlay.registerForEvent(XMLOVERLAY_LOAD, null, postLoadXml);
   
    /* Set up filter profiles */
    filterProfiles = new FilterProfile();     
    
    /* Deal with some request parameters */
    if (args['filter'] != null)
      filterProfiles.selectProfile(args['filter']);
    
    if (args['findcall'] != null)
      findItem( args['findcall'], false); 
    
    if (args['track'] != null) {
      findItem( args['track'], false)
      toggleTracked(args['track']);
    }
    
    if (args['scale'] != null)
    {
      var scale = parseInt(args['scale'], 10); 
      if (!isNaN(scale))
         myKaMap.zoomToScale(scale); 
    }
    
    switchMode('toolPan');    
    
    if (isMobile)
      document.getElementById('geoPosition').ontouchend = function(e)
      { if (gpsTracker != null) 
          gpsTracker.toggleSpeedDisplay(); 
      };
    
    /* Main menu on toolbar */
    if (!isIframe && !isMobile) 
       addContextMenu('buttonMenu', 'MAIN');
    
    /* Context menus */
    var vp = myKaMap.olMap.getViewport();
    vp.onmousedown = menuMouseSelect;
    vp.oncontextmenu = function(e) 
         { e = (e)?e:((event)?event:null);
           if (document.kaCurrentTool != myKaRuler) 
              ctxtMenu.show(null, e); e.cancelBubble = true; }      
    document.getElementById('toolbar').oncontextmenu = function(e)     
         { e = (e)?e:((event)?event:null); 
           e.cancelBubble = true; }
         
    if (ie) {
       vp.onclick = function(e)
          { if (document.kaCurrentTool != myKaQuery) menuMouseSelect(); }
       document.getElementById('toolbar').onclick = function(e)
          { e = (e)?e:((event)?event:null);
            if (document.kaCurrentTool != myKaQuery) menuMouseSelect();  e.cancelBubble = true;}   
     }
     else {
       vp.onmouseup = function(e)
          { menuMouseSelect(); }
       document.getElementById('toolbar').onmouseup = function(e)
          { if (isMenu) menuMouseSelect(); e.cancelBubble = true;}       
     }
     
     
     
     initialized = true;
     getXmlData(false, true); 
     
     /* Welcome info page */
     if (!isIframe && !isMobile && !ses_storage['polaric.welcomed']) {
        ses_storage['polaric.welcomed'] = true;
        setTimeout( function() { welcome(); }, 2000);
     }
}



function welcome()
{  
   remotepopupwindowCSS(myKaMap.domObj, 'welcome.html', 1, 1, 'welcome');
}


/*
 * Construct a query string (for server) representing the current map extent 
 */
function extentQuery()
{
    var ext = myKaMap.getGeoExtents();
    var flt = "";
    if (filterProfiles.selectedProf() != null)
        flt = "&filter="+filterProfiles.selectedProf();
    return "x1="  + roundDeg(ext[0]) + "&x2="+ roundDeg(ext[1]) +
           "&x3=" + roundDeg(ext[2]) + "&x4="+ roundDeg(ext[3]) + flt ;
}

function roundDeg(x)
   { return Math.round(x*1000)/1000; } 

/* 
 * Get XML overlay data from server.  
 */
var xmlSeqno = 0;
var retry = 0;
var lastXmlCall = 0;



function getXmlData(wait, metaonly)
{
   xmlSeqno++;
   var sar_string = (sar_key == null ? '' : 'sar_'+sar_key+'/');
   var url = server_url + sar_string + (getLogin() ? 'srv/mapdata_sec?' : 'srv/mapdata?');
   
   var i = myOverlay.loadXml(url+extentQuery() + "&scale="+currentScale+
                  (wait?"&wait=true":"") + (clientses!=null? "&clientses="+clientses : "") + 
                  (metaonly? "&metaonly=true" : "") + "&utmz="+utmzone );
   lastXmlCall = i; 
   
   var _xmlSeq = xmlSeqno;
   if (wait) setTimeout( function() 
     { 
         if (xmlSeqno == _xmlSeq)
            { retry++;
              if (retry >= 2) {
                 OpenLayers.Console.warn("XML Call Timeout. Max retry cnt reached. RELOAD");
                 window.location.reload();
              }
              else {
                 OpenLayers.Console.warn("XML Call Timeout. Abort and retry"); 
                 abortCall(i); 
                 getXmlData(false); 
              }
            }             
     }, 150000 );  
}


/*
 * Called if Ajax call to server fails. 
 */
function postLoadXml_Fail()
{
  OpenLayers.Console.warn("XML Call: Not found");
  if (sar_key != null) {
     alert("Ikke tilgang til SAR info. Ugyldig nøkkel");
     removeSarKey(); 
     show_SAR_access(false);
  }
}



/* Called after XML is received from the server */
function postLoadXml() 
{
     retry = 0;
     if (myOverlay.meta.clientses != null)
        clientses = myOverlay.meta.clientses;   
        
     var sdiv = document.getElementById('sarmode');
     if (myOverlay.meta.sarmode != null && myOverlay.meta.sarmode == 'true') 
        sdiv.style.visibility = 'visible';
     else
        sdiv.style.visibility = 'hidden';
     
     filterProfiles.init(); 
     show_SAR_access(getLogin() != null);

     if (!isIframe && !isMobile && !isMobileApp && getLogin() != null) {
        ldiv = document.getElementById('login')
        ldiv.innerHTML = getLogin(); 
        ldiv.className = 'login';
     }
     if (myOverlay.meta.metaonly == null || myOverlay.meta.metaonly != "true") 
        getXmlData(true);
}

 


/**
 * Event handler (KaMap callback)
 * called when kaMap tells us the scale has changed
 */
var currentScale = -1;
function myScaleChanged( eventID, scale ) 
{
    scale = Math.round(scale);   
    if (scale != currentScale) {
        OpenLayers.Console.info("SCALE CHANGED: ", scale);
        currentScale = scale;
        myScalebar.update(scale);    
        if (scale >= 1000)
            scale = Math.round(scale / 100) * 100;
        if (scale >= 10000)
            scale = Math.round(scale / 1000) * 1000;
   
        if (scale >= 1000000) {
            scale = Math.round(scale / 100000) * 100000; 
            scale = scale / 1000000;
            scale = scale + " Million";
        }
        else if (scale >= 10000)
            scale = (Math.round(scale/1000) + " 000");
    
        var outString = 'current scale  1 : '+ scale;
        getRawObject('scale').innerHTML = outString;
    }
}



/**
 * Event handler (KaMap callback)
 * handle the extents changing by updating a link in the interface that links
 * to the current view
 */
var prev_extents = null;
function myExtentChanged( eventID, extents ) 
{
       if ( prev_extents == null ||
           roundDeg(extents[0]) != roundDeg(prev_extents[0]) ||
           roundDeg(extents[1]) != roundDeg(prev_extents[1]) ||
           roundDeg(extents[2]) != roundDeg(prev_extents[2]) ||
           roundDeg(extents[3]) != roundDeg(prev_extents[3])) 
       {                   
           OpenLayers.Console.info("EXTENTS CHANGED: ", extents);
           if (initialized) {
               storage[uid+'.extents.0'] = roundDeg(extents[0]).toString();
               storage[uid+'.extents.1'] = roundDeg(extents[1]).toString();
               storage[uid+'.extents.2'] = roundDeg(extents[2]).toString();
               storage[uid+'.extents.3'] = roundDeg(extents[3]).toString();
               storage[uid+'.baselayer'] = myKaMap.getBaseLayer().id; 
           }
           setTimeout(function() {myKaMap.evaluateLayers();}, 50);
           if (initialized) {
               setTimeout( function() { getXmlData(false);}, 500);
               myKaMap.updateObjects();
           } 
           else
               setTimeout( function() { getXmlData(false);}, 2000);
           prev_extents = extents;
       } 
       myKaRuler.reset();
       myScaleChanged(null, myKaMap.getCurrentScale());
}


/* Event handler  (KaMap callback)
 * Called when base layer is changed 
 */
function myLayersChanged(eventID, map) {   
    if (initialized) 
       getXmlData(false);
}


/*
 * Event handler  (KaMap callback)
 */
function myQuery( eventID, queryType, coords ) 
{
    if (menuMouseSelect()) {
       popup_posInfoXY(coords[0], coords[1]); 
    }
    return false;  
}


/*
 * Event handler  (KaMap callback)
 */
function myMapClicked( eventID, coords ) {
     return true; 
}


/*
 * Event handler (KaMap callback)
 */
function myMouseMoved( eventID, position) {
    var llref = new LatLng(position.y, position.x);     
    var uref = llref.toUTMRef();
    geopos.innerHTML = llref.toUTMRef() + '<br>'+ll2Maidenhead(llref.lat, llref.lng) + '&nbsp;<span class="latlng">' + 
        formatDeg(llref)+'</span>';

  function formatDeg(llref) {
     latD = Math.floor(Math.abs(llref.lat)); 
     lonD = Math.floor(Math.abs(llref.lng));
     return latD+"\u00B0 " + Math.round((Math.abs(llref.lat)-latD)*60)+"\' " + (llref.lat<0 ? "S " : "N ") + "&nbsp;" + 
            lonD+"\u00B0 " + Math.round((Math.abs(llref.lng)-lonD)*60)+"\' " + (llref.lng<0 ? "W" : "E") ;
  }
}


function myObjectClicked(ident, e, href, title) 
{
    e = (e)?e:((event)?event:null); 
    var x = (e.pageX) ? e.pageX : e.clientX;  
    var y = (e.pageY) ? e.pageY : e.clientY; 
    
    menuMouseSelect();
    if (href) 
       setTimeout( function() { displayLink(href,title,x,y);}, 100);
    else
       popup_stationInfo(ident, false, x, y);
    e.cancelBubble = true;
    return false; 
}



function displayLink(href, title, x, y)
{
  if ( /^(p|P):.*/.test(href) )
    popupwindow( myKaMap.domObj, 
                 '<h1>'+title+'</h1>' +
                 '<img class=\"popupimg\" src=\"'+href.substring(2)+'\">'
                 , x, y, null, 'obj_click', true);    
    else
      if (!isMobileApp) 
        window.location = href; 
}




/*  Trail */
function myTrailClicked(ident, e) {
    e = (e)?e:((event)?event:null); 
    var x = (e.pageX) ? e.pageX : e.clientX;  
    var y = (e.pageY) ? e.pageY : e.clientY; 
    
    menuMouseSelect();
    if (ie)
       remotepopupwindow(myKaMap.domObj, 
       server_url + 'srv/trailpoint?ajax=true&id='+ident+"&time="+e.srcElement._time, x, y);
    else
       remotepopupwindow(myKaMap.domObj,
       server_url + 'srv/trailpoint?ajax=true&id='+ident+"&time="+e.target._time, x, y);
    e.cancelBubble = true; 
    if (e.stopPropagation) e.stopPropagation();
    return false;
}


/*  Trail */
function histList_hover(ident, index)
{
   var x = document.getElementById(ident+"_"+index+"_trail");
   if (x != null) 
        x.setAttribute("class", "trailPoint_hover");
}


function histList_hout(ident, index)
{
   var x = document.getElementById(ident+"_"+index+"_trail");
   if (x != null) 
        x.setAttribute("class", "trailPoint");
}


function parsePosPix(str) {
   str = str.substr(0,str.length()-2); 
   return safeParseInt(str);
}


function histList_click(ident, index)
{
   function parsePosPix(str) {
      str = str.substr(0, str.length-2); 
      return safeParseInt(str);
   }
   
   var point = document.getElementById(ident+"_"+index+"_trail");
   menuMouseSelect();
   point.setAttribute("class", "trailPoint");
   var parent = point.parentNode;
   var x = parsePosPix(point.style.left) + parsePosPix(parent.style.left) + 
           parsePosPix(parent.parentNode.style.left) + 10;
   var y = parsePosPix(point.style.top) + parsePosPix(parent.style.top) + 
           parsePosPix(parent.parentNode.style.top) + 10;
   remotepopupwindow(myKaMap.domObj, 
      server_url + 'srv/trailpoint?ajax=true&id='+ident+"&index="+index, x, y); 
}




function ll2Maidenhead(lat, lng) 
{
   var z1 = lng + 180;
   var longZone1 = Math.floor( z1 / 20);
   var char1 = chr(65 + longZone1);

   var z2 = lat + 90;
   var latZone1 = Math.floor(z2 / 10);
   var char2 = chr(65 + latZone1);

   var longZone2 = Math.floor((z1 % 20) / 2);
   var char3 = chr(48 + longZone2);

   var latZone4 = Math.floor(z2 % 10);
   var char4 = chr(48 + latZone4);

   var longZone5 = Math.floor(((lng + 180) % 2) * 12);
   var char5 = chr(97 + longZone5);

   var latZone6 = Math.floor(((lat + 90) % 1) * 24);
   var char6 = chr(97 + latZone6);
   
   return char1+char2+char3+char4+char5+char6;
}



/**
 * parse the query string sent to this window into a global array of key = value pairs
 * this function should only be called once
 */
function parseQueryString() {
    queryParams = {};
    var s=window.location.search;
    if (s!='') {
        s=s.substring( 1 );
        var p=s.split('&');
        for (var i=0;i<p.length;i++) {
            var q=p[i].split('=');
            queryParams[q[0]]=q[1];
        }
    }
}




/**
 * get a query value by key.  If the query string hasn't been parsed yet, parse it first.
 * Return an empty string if not found
 */
function getQueryParam(p) {
    if (!queryParams) {
        parseQueryString();
    }
    if (queryParams[p]) {
        return queryParams[p];
    } else {
        return '';
    }
}



/**
 * called when the map selection changes due to the user selecting a new map.
 * By calling myKaMap.selectMap, this triggers the KAMAP_MAP_INITIALIZED event
 * after the new map is initialized which, in turn, causes myMapInitialized
 * to be called
 */
function mySetMap( name ) {
   window.storage[uid+'.view'] = name;
   myKaMap.selectMap( name );
}



function toggleToolbar(obj) {
    if (obj.style.backgroundImage == '') {
        obj.isOpen = true;
    }

    if (obj.isOpen) {
        obj.title = 'show toolbar';
        obj.style.backgroundImage = 'url(' +server_url+ 'KaMap/images/arrow_down.png)';
        var bValue = getObjectTop(obj);;
        var d = getObject('toolbar');
        d.display = "none";
        obj.isOpen = false;
        obj.style.top = "3px";
    } else {
        obj.title = 'hide toolbar';
        obj.style.backgroundImage = 'url(' +server_url+ 'KaMap/images/arrow_up.png)';
        var d = getObject('toolbar');
        d.display="block";
        obj.isOpen = true;
        var h = getObjectHeight('toolbar');
        obj.style.top = (h + 3) + "px";
    }
}




function toggleReference(obj) {
    if (obj.style.backgroundImage == '') {
        obj.isOpen = true;
    }

    if (obj.isOpen) {
        obj.title = 'show reference';
        obj.style.backgroundImage = 'url(' +server_url+ 'KaMap/images/arrow_up.png)';
        var d = getObject('reference');
        d.display = 'none';
        obj.isOpen = false;
        obj.style.bottom = '8px';
    } else {
        obj.title = 'hide reference';
        obj.style.backgroundImage = 'url(' +server_url+ 'KaMap/images/arrow_down.png)';
        var d = getObject('reference');
        d.display = 'block';
        obj.isOpen = true;
        obj.style.bottom = (getObjectHeight('reference') + 5) + 'px';
    }
}



/**
 * switchMode
 * ...
 */
function switchMode(id) {
  if (!isIframe && !isMobile && id=='toolRuler') { 
        myKaRuler.activate();
        objectClickable = false; 
        getRawObject('toolRuler').style.backgroundImage = 
           'url(' +server_url+ 'KaMap/images/icon_set_nomad/ruler2.gif)'; 
        getRawObject('toolQuery').style.backgroundImage = 
           'url(' +server_url+ 'KaMap/images/icon_set_nomad/tool_query_1.png)';
        getRawObject('toolPan').style.backgroundImage = 
           'url(' +server_url+ 'KaMap/images/icon_set_nomad/tool_pan_1.png)';
        getRawObject('toolZoomRubber').style.backgroundImage = 
           'url(' +server_url+ 'KaMap/images/icon_set_nomad/tool_rubberzoom_1.png)';
    } else if (id=='toolQuery') {
        myKaQuery.activate();
        objectClickable = true; 
        if (!isIframe && !isMobile)
          getRawObject('toolRuler').style.backgroundImage = 
             'url(' +server_url+ 'KaMap/images/icon_set_nomad/ruler1.gif)'; 
        getRawObject('toolQuery').style.backgroundImage = 
           'url(' +server_url+ 'KaMap/images/icon_set_nomad/tool_query_2.png)'; 
        getRawObject('toolPan').style.backgroundImage = 
           'url(' +server_url+ 'KaMap/images/icon_set_nomad/tool_pan_1.png)';
        getRawObject('toolZoomRubber').style.backgroundImage = 
           'url(' +server_url+ 'KaMap/images/icon_set_nomad/tool_rubberzoom_1.png)';
    } else if (id=='toolPan') {
        /* Panning/zooming is handled by OpenLayers */
        myKaNavigator.activate();
        objectClickable = true; 
        if (!isIframe && !isMobile)
          getRawObject('toolRuler').style.backgroundImage = 
             'url(' +server_url+ 'KaMap/images/icon_set_nomad/ruler1.gif)'; 
        getRawObject('toolQuery').style.backgroundImage = 
           'url(' +server_url+ 'KaMap/images/icon_set_nomad/tool_query_1.png)'; 
        getRawObject('toolPan').style.backgroundImage = 
           'url(' +server_url+ 'KaMap/images/icon_set_nomad/tool_pan_2.png)';
        getRawObject('toolZoomRubber').style.backgroundImage = 
           'url(' +server_url+ 'KaMap/images/icon_set_nomad/tool_rubberzoom_1.png)';
    } else if (id=='toolZoomRubber') {
        myKaRubberZoom.activate();
        objectClickable = false; 
        if (!isIframe && !isMobile)
          getRawObject('toolRuler').style.backgroundImage =
             'url(' +server_url+ 'KaMap/images/icon_set_nomad/ruler1.gif)'; 
        getRawObject('toolQuery').style.backgroundImage = 
           'url(' +server_url+ 'KaMap/images/icon_set_nomad/tool_query_1.png)'; 
        getRawObject('toolPan').style.backgroundImage = 
           'url(' +server_url+ 'KaMap/images/icon_set_nomad/tool_pan_1.png)';
        getRawObject('toolZoomRubber').style.backgroundImage = 
           'url(' +server_url+ 'KaMap/images/icon_set_nomad/tool_rubberzoom_2.png)';
    } else {
        myKaNavigator.activate();
        objectClickable = true; 
    }
}

