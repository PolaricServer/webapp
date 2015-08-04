/**********************************************************************
 *
 * $Id: kaMap.js,v 1.1.1.1 2006-10-20 10:49:46 oivindh Exp $
 *
 * purpose: core engine for implementing a tiled, continuous pan mapping
 *          engine.
 *
 * author: Paul Spencer (pspencer@dmsolutions.ca)
 *
 * The original kaMap code was written by DM Solutions Group.
 * bug fixes contributed by Lorenzo Becchi and Andrea Cappugi
 * max_extents support by Tim Schaub
 *
 * Integrated with OpenLayers and unnecessary parts removed.
 * Øyvind Hanssen (ohanssen@acm.org)
 *
 *
 **********************************************************************
 *
 * Copyright (c) 2005, DM Solutions Group Inc.
 * Copyright (c) 2009-2014, Øyvind Hanssen, LA7ECA (ohanssen@acm.org)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 **********************************************************************/


/**
 * kaMap! events
 */
var gnLastEventId = 0;
var KAMAP_ERROR = gnLastEventId ++;
var KAMAP_WARNING = gnLastEventId ++;
var KAMAP_NOTICE = gnLastEventId++;
var KAMAP_INITIALIZED = gnLastEventId ++;
var KAMAP_MAP_INITIALIZED = gnLastEventId ++;
var KAMAP_EXTENTS_CHANGED = gnLastEventId ++;
var KAMAP_SCALE_CHANGED = gnLastEventId ++;
var KAMAP_LAYERS_CHANGED = gnLastEventId ++;
var KAMAP_LAYER_STATUS_CHANGED = gnLastEventId ++;
var KAMAP_CONTEXT_MENU = gnLastEventId ++;
var KAMAP_METAEXTENTS_CHANGED = gnLastEventId++;
var KAMAP_MAP_CLICKED = gnLastEventId++;
var KAMAP_MOVE_START = gnLastEventId++;
var KAMAP_MOVE_END = gnLastEventId++;

/******************************************************************************
 * kaMap main class
 *
 * construct a new kaMap instance.  Pass the id of the div to put the kaMap in
 *
 * this class is the main API for any application.  Only use the functions
 * provided by this API to ensure everything functions correctly
 *
 * szID - string, the id of a div to put the kaMap! into
 *
 *****************************************************************************/

function kaMap( szID ) {

    this.szID = szID;
    this.domObj = this.getRawObject( szID );
    this.domObj.style.overflow = 'hidden';

    /**
     * initialization states
     * 0 - not initialized
     * 1 - initializing
     * 2 - initialized
     */
    this.initializationState = 0;


    //keep a reference to the inside layer since we use it a lot
    this.theInsideLayer = null;

    // an array of available maps (pre-selected areas). C
    this.aMaps = new Array(); 
    this.currentMap = '';
    
    //event manager
    this.eventManager = new _eventManager();

    //this is a convenience to allow redirecting the client code to a server
    //other than the one that this file was loaded from.  This may not
    //work depending on security settings, except for loading tiles since
    //those come directly from a php script instead of an XmlHttpRequest.
    //
    //by default, if this is empty, it loads from the same site as the
    //page loaded from.  If set, it should be a full http:// reference to the
    //directory in which init.php, tile.php and the other scripts are located.
    this.server = this.server = server_url ? server_url : '';

    this.aObjects = [];
    this.aCanvases = [];
    this.aTools = [];
    this.aInfoTools = [];

    /* register the known events */
    for (var i=0; i<gnLastEventId; i++) {
        this.registerEventID( i );
    }
    
    this.thandler = new touchHandler();
    this.createLayers();
    this.prevProj = null; 
    this.prevScale = 0;
    this.prevGda = 1;
    this.llProjection = "EPSG:4326";
    
    /*
     * OpenLayers dont always get right DPI for screen. 
     * This is a workaround. 
     */
    if (!isMobileApp) {
      var DOM_body = document.getElementsByTagName('body')[0];        
      var DOM_div = document.createElement('div');
      DOM_div.style = 'width: 1in; visibility:hidden;';
      DOM_body.appendChild(DOM_div);
      var w = document.defaultView.getComputedStyle(DOM_div, null).getPropertyValue('width');
      DOM_body.removeChild(DOM_div);
      OpenLayers.DOTS_PER_INCH = parseInt(w);
    }
};
 
 

kaMap.prototype.getMapProjection = function()
{
   return this.olMap.getProjectionObject();
}




kaMap.prototype.getResolution = function()
{
    return this.olMap.getResolution();
}



/**
 * kaMap.initialize( )
 *
 * main initialization of kaMap.  This must be called after page load and
 * should only be called once (i.e. on page load).  It does not perform
 * intialization synchronously.  This means that the function will return
 * before initialization is complete.  To determine when initialization is
 * complete, the calling application must register for the KAMAP_INITIALIZED
 * event.
 * 
 * returns true
 */

kaMap.prototype.initialize = function() {
    var t = this;
    if (t.initializationState == 2) {
        t.triggerEvent( KAMAP_ERROR, 'ERROR: ka-Map! is already initialized!' );
        return false;
    } else if (t.intializationState == 1) {
        t.triggerEvent( KAMAP_WARNING, 'WARNING: ka-Map! is currently initializing ... wait for the KAMAP_INITIALIZED event to be triggered.' );
        return false;
    }
    t.utmProjection = utm_projection;
    setTimeout( function() { t.initializeOL(); }, 50); 
    t.initializationState = 1;
    return true; 
};




kaMap.prototype.initializeOL = function( ) {
  var t = this; 
  
  
  /* map OpenLayers events to kaMap events */
  function zoomEnd() {
    OpenLayers.Console.info("ZOOM END: scale=", this.getCurrentScale());
    this.prevScale = this.getCurrentScale();
    t.triggerEvent(KAMAP_SCALE_CHANGED, this.prevScale);
    t.triggerEvent(KAMAP_EXTENTS_CHANGED, this.getGeoExtents());
  }
  
  function moveEnd() {
    mousetrack_suspend = false;   
    t.triggerEvent(KAMAP_EXTENTS_CHANGED, t.getGeoExtents());
    t.triggerEvent(KAMAP_MOVE_END); 
  }
  
  
  function moveStart() {
    mousetrack_suspend = true;
    t.triggerEvent(KAMAP_MOVE_START);
  }
  
  
  /* This function is called each time the user changes base layer */
  function layerChange() { 
    /* First, get the center point of the map, transform the coordinates
     * and re-center the map of the layer. This is necessary if switching
     * from a UTM to a spherical mercator projection. 
     */
    var center = this.olMap.getCenter(); 
    if (center==null)
       return;  
    center = center.transform(this.prevProj, this.getMapProjection());
    t.olMap.setCenter(center);
    
    /* If the projection is sperical mercator, we do a geodetic adjustment 
     * of the scale. It may be necessary to zoom the map accordingly, if 
     * switching to/from a spherical mercator projection. 
     */
    var gda = this.geodeticAdjustment(); 
    if (gda < 1 && t.prevGda == 1) 
       t.zoomToScale(t.olMap.getScale()/(gda*1.4), true);
    else if (t.prevGda < 1 & gda == 1) 
       t.zoomToScale(t.olMap.getScale()*(t.prevGda/1.4), true);
    
    this.prevProj = this.getMapProjection();
    this.prevGda = gda;
  
    setGray();
    t.triggerEvent(KAMAP_LAYERS_CHANGED);
    t.triggerEvent(KAMAP_SCALE_CHANGED, this.getCurrentScale());
  }
  
  
  
  function setGray() {    
    if (t.getBaseLayer().gray)
       $('#canvasBG').css('opacity', t.getBaseLayer().gray); 
    else
       $('#canvasBG').css('opacity', '0.33'); 
  }
  

  

  /*
   * OpenLayers integration.
   * The options and the layers are defined in mapconfig.js
   */
  t.olMap = new OpenLayers.Map(
     {
        projection       : utm_projection,
 //       displayProjection: utm_projection,
        units            : 'm',
        numZoomLevels    : max_zoomlevels,
        zoomMethod       : null,
        maxExtent        : new OpenLayers.Bounds(max_extent[0], max_extent[1], max_extent[2], max_extent[3]),
        maxResolution    : max_resolution, 
        minResolution    : min_resolution, 
        controls         : [new OpenLayers.Control.Navigation(), new OpenLayers.Control.Attribution()]
     });

   t.addLayers();


   
  /* Map views (pre-selected areas). Initialize a dictionary 
   * using name as index 
   */
  if (mapViews != null)
    for (var i = 0; i < mapViews.length; i++) {
      var x = new View (mapViews[i]);
      t.aMaps[x.name] = x;
    }
  
  t.olMap.getViewport().appendChild(t.theInsideLayer);
  t.domObj.style.overflow = 'hidden';
  t.viewportWidth = t.getObjectWidth(t.domObj);
  t.viewportHeight = t.getObjectHeight(t.domObj);
  t.setBackgroundColor( backgroundColor );  
  t.triggerEvent( KAMAP_MAP_INITIALIZED );

  /* 
   * Set up OL controls, Permalink setup, etc.. 
   */  
  t.olMap.events.register("changebaselayer", t, layerChange);
  t.olMap.events.register("zoomend", t, zoomEnd);
  t.olMap.events.register("moveend", t, moveEnd);
  t.olMap.events.register("movestart", t, moveStart);

  if (!isMobile) 
    t.olMap.addControl( new OpenLayers.Control.PanZoomBar() );
//  t.olMap.addControl( new OpenLayers.Control.LayerSwitcher() );
  t.plink = new OpenLayers.Control.Permalink();
  t.plink.setMap(t.olMap);  
  document.getElementById('permolink').appendChild(this.plink.draw());
  t.plink.element.innerHTML="link to this view";
  t.olMap.render(t.domObj);
  t.prevScale = t.getCurrentScale();
  t.prevProj = t.getMapProjection();
  setTimeout(setGray, 100);
  
  t.triggerEvent( KAMAP_INITIALIZED );
  t.triggerEvent( KAMAP_SCALE_CHANGED, t.getCurrentScale());   
  t.initializationState = 2; 
}
/* End of initializeOL */



kaMap.prototype.addLayers = function() {
  if (mapLayers != null && mapLayers.length > 0) 
    for (var i=0; i < mapLayers.length; i++) 
        this.olMap.addLayer(mapLayers[i].layer);
};


/*
 * Re-evaluate what layers to be shown in layer switcher list. 
 */
kaMap.prototype.evaluateLayers = function() {
  var vlayer = -1; 
  if (mapLayers != null && mapLayers.length > 0) {
     for (var i=0; i < mapLayers.length; i++) { 
        var pred = mapLayers[i].predicate(); 
        mapLayers[i].layer.displayInLayerSwitcher = pred;
        
        if (!mapLayers[i].layer.isBaseLayer && !pred) 
            mapLayers[i].layer.setVisibility(false);
        
        if (mapLayers[i].layer.isBaseLayer && mapLayers[i].layer.getVisibility()) {
            mapLayers[i].layer.setVisibility(false);
            if (pred) 
                vlayer = i; 
        }
     }
     if (vlayer == -1) {
       for (var i=0; i < mapLayers.length; i++)  
         if (mapLayers[i].layer.isBaseLayer && mapLayers[i].layer.displayInLayerSwitcher) {
              this.olMap.baseLayer = mapLayers[i].layer;
              this.olMap.events.triggerEvent("changebaselayer");
              mapLayers[i].layer.setVisibility(true);  
              return; 
          }
     }  
     else
        mapLayers[vlayer].layer.setVisibility(true);
  }
};




/**
 * kaMap.setBackgroundColor( color )
 *
 * call this to set a background color for the inside layer.  This color
 * shows through any transparent areas of the map.  This is primarily
 * intended to be used by the initializeMap callback function to set the
 * background to the background color in the map file.
 *
 * color: string, a valid HTML color string
 *
 * returns true;
 */
kaMap.prototype.setBackgroundColor = function( color ) {
    this.domObj.style.backgroundColor = color;
    return true;
};




/**
 * hidden method of kaMap to initialize all the various layers needed by
 * kaMap to draw and move the map image.
 */
kaMap.prototype.createLayers = function() {
    var t = this;
    this.theInsideLayer = document.createElement('div');
    this.theInsideLayer.id = 'theInsideLayer';
    this.theInsideLayer.style.position = 'absolute';
    this.theInsideLayer.style.left = '0px';
    this.theInsideLayer.style.top = '0px';
    this.theInsideLayer.style.zIndex = '750';
    this.theInsideLayer.kaMap = this;
    if (this.currentTool) {
        this.theInsideLayer.style.cursor = this.currentTool.cursor;
    }
    
    this.domObj.kaMap = this;
    this.theInsideLayer.onclick = function (e) { t.onclick(e); }
    this.theInsideLayer.onmousedown = function (e) { t.onmousedown(e); }
    this.theInsideLayer.onmouseup = function (e) { t.onmouseup(e); }
    this.theInsideLayer.onmousemove = function (e) { t.onmousemove(e); }
    this.theInsideLayer.onmouseover = function (e) { t.onmouseover(e); } 
    this.domObj.onmouseout = function (e) { t.onmouseout(e); }
    this.theInsideLayer.onkeypress = function (e) { t.onkeypress(e); }
    this.theInsideLayer.ondblclick = function (e) { t.ondblclick(e); }
    this.theInsideLayer.oncontextmenu = function (e) { t.oncontextmenu(e); }
    this.theInsideLayer.onmousewheel = function (e) { t.onmousewheel(e); }
    
        /* Map touch events */
    this.theInsideLayer.ontouchstart = function (e) 
            { t.thandler.handle(e);
              t.onmousedown(e);}
    this.theInsideLayer.ontouchmove = function (e) 
            { t.thandler.handle(e); 
              t.onmousemove(e);  }
    this.theInsideLayer.ontouchend = function (e) 
            { t.thandler.handle(e); t.onmouseup(e);}       
    this.theInsideLayer.ontouchcancel = function (e) 
            { t.thandler.handle(e); } 
      
    if (window.addEventListener)
        this.domObj.addEventListener( "DOMMouseScroll", 
             function(e) {t.onmousewheel(e);} , false );

   this.olMap = null;
};




// Convert object name string or object reference
// into a valid element object reference
kaMap.prototype.getRawObject = function(obj) {
    var theObj;
    if (typeof obj == "string") {
        theObj = document.getElementById(obj);
    } else {
        theObj = obj;
    }
    return theObj;
};




// Retrieve the rendered width of an element
kaMap.prototype.getObjectWidth = function(obj)  {
    var elem = this.getRawObject(obj);
    var result = 0;
    if (elem.offsetWidth) {
        result = elem.offsetWidth;
    } else if (elem.clip && elem.clip.width) {
        result = elem.clip.width;
    } else if (elem.style && elem.style.pixelWidth) {
        result = elem.style.pixelWidth;
    }
    return parseInt(result);
};



// Retrieve the rendered height of an element
kaMap.prototype.getObjectHeight = function(obj)  {
    var elem = this.getRawObject(obj);
    var result = 0;
    if (elem.offsetHeight) {
        result = elem.offsetHeight;
    } else if (elem.clip && elem.clip.height) {
        result = elem.clip.height;
    } else if (elem.style && elem.style.pixelHeight) {
        result = elem.style.pixelHeight;
    }
    return parseInt(result);
};



   
/**
 * kaMap.zoomTo( lon, lat )
 *
 * zoom to some geographic point (in current projection) 
 *
 * lon - the x coordinate to zoom to
 * lat - the y coordinate to zoom to
 */
kaMap.prototype.zoomTo = function( x, y ) {
     var p = new OpenLayers.LonLat(x, y);
     p.transform(this.llProjection, this.getMapProjection());
     this.olMap.setCenter(p);
};


kaMap.prototype.zoomToPix = function(x, y, t)
{ 
  var coord = this.pixToGeo(x, y-5);
  this.zoomToGeo(coord[0], coord[1], t);
}


kaMap.prototype.zoomToGeo = function(x, y, t)
{      
  // FIXME: Must do the proper transformation of extent here?????
  var extents = this.getGeoExtents();
  var xx = extents[0];
  var xy = extents[1]; 
  var cx = (extents[2] - extents[0])/2;
  var cy = (extents[3] - extents[1])/2;
  if (!t)
    t = 0.05; 
  var tx = cx * t;
  var ty = cy * t; 
  if (x < xx+cx-tx || x > xx+cx+tx || y < xy+cy-ty || y > xy+cy+ty) {
    this.zoomTo(x, y);
  }
}



/**
 * kaMap.zoomToExtents( minx, miny, maxx, maxy )
 *
 * best fit zoom to extents.  Center of extents will be in the center of the
 * view and the extents will be contained within the view at the closest scale
 * available above the scale these extents represent
 *
 * minx, miny, maxx, maxy - extents in units of current projection.
 */
kaMap.prototype.zoomToExtents = function(minx, miny, maxx, maxy) {

      var b = new OpenLayers.Bounds(minx, miny, maxx, maxy);
      b.transform(this.llProjection, this.getMapProjection());
      this.olMap.zoomToExtent(b, true);
};


kaMap.prototype.getExtent = function () {
   return this.olMap.getExtent(); 
}

kaMap.prototype.getCenter = function() {
   return this.olMap.getCenter().transform(this.getMapProjection(), this.llProjection);
}

/**
 * kaMap.createDrawingCanvas( idx )
 *
 * create a layer on which objects can be drawn (such as point objects)
 *
 * idx - int, the z-index of the layer.  Should be < 100 but above the map
 * layers.
 */
kaMap.prototype.createDrawingCanvas = function( idx, bg ) {
    var d = document.createElement( 'div' );
    d.style.position = 'absolute';    
    d.id = 'canvas';
    d.style.left = '0px';
    d.style.top = '0px';
    d.style.zIndex = idx;
    this.theInsideLayer.appendChild( d );
    d.style.width= '1px';
    d.style.height = '1px';
    
    if (bg) {
      var db = document.createElement( 'div' );
      db.id = 'canvasBG';
      d.appendChild(db);  
      db.style.marginLeft = '-100px';
      db.style.marginTop = '-100px';
      db.style.width='3000px';
      db.style.height='3000px';
    }
     
    this.aCanvases.push( d );
    d.kaMap = this;
    return d;
};




kaMap.prototype.removeDrawingCanvas = function( canvas ) {

    for (var i=0; i<this.aCanvases.length;i++) {
        if (this.aCanvases[i] == canvas) {
            this.aCanvases.splice( i, 1 );
        }
    }
    this.theInsideLayer.removeChild(canvas);
    canvas.kaMap = null;
    return true;
};



/**
 * kaMap.addObjectGeo( canvas, lon, lat, obj )
 *
 * add an object to a drawing layer and position it at the given geographic
 * position.  This is defined as longitude and latitude in degrees. 
 *
 * canvas   - object, the drawing canvas to add this object to
 * lon, lat - position
 * obj      - object, the object to add (an img, div etc)
 *
 * returns true
 */
kaMap.prototype.addObjectGeo = function( canvas, lon, lat, obj ) {
    obj.lon = lon;
    obj.lat = lat; 
    obj.style.position = 'absolute';
    obj.canvas = canvas;
    canvas.appendChild( obj );
    this.aObjects.push( obj );
}; 




/**
 * kaMap.removeObject( obj )
 *
 * removes an object previously added with one of the addObjectXxx calls
 *
 * obj - object, an object that has been previously added, or null to remove
 *       all objects
 *
 * returns true if the object was removed, false otherwise (i.e. if it was
 * never added).
 */
kaMap.prototype.removeObject = function( obj ) {
    if (obj == null) {
        for (var i=0; i<this.aObjects.length; i++) {
            obj = this.aObjects[i];
            if (obj.canvas) {
                obj.canvas.removeChild(obj);
            }
        }
        this.aObjects = [];
        return true;
    } else {
        for (var i=0; i<this.aObjects.length; i++) {
            if (this.aObjects[i] == obj) {
                obj = this.aObjects[i];
                if (obj.canvas) {
                    obj.canvas.removeChild( obj );
                    obj.canvas = null;
                }
                this.aObjects.splice(i,1);
                return true;
            }
        }
        return false;
    }
};


/**
 * kaMap.removeAllObjects( canvas )
 *
 * removes all objects on a particular canvas
 *
 * canvas - a canvas that was previously created with createDrawingCanvas
 */
kaMap.prototype.removeAllObjects = function(canvas) {
    for (var i=0; i<this.aObjects.length; i++) {
       obj = this.aObjects[i];
       if (obj.canvas && obj.canvas == canvas) {
          obj.canvas.removeChild( obj );
          obj.canvas = null;
          this.aObjects.splice(i--,1);
       }
    }
    return true;
};


/**
 * kaMap.centerObject( obj )
 *
 * slides the map to place the object at the center of the map
 *
 * obj - object, an object previously added to the map
 *
 * returns true
 */
kaMap.prototype.centerObject = function(obj) {
    var vpX = -safeParseInt(this.theInsideLayer.style.left) + this.viewportWidth/2;
    var vpY = -safeParseInt(this.theInsideLayer.style.top) + this.viewportHeight/2;

    var xOffset = (obj.xOffset)?obj.xOffset:0;
    var yOffset = (obj.yOffset)?obj.yOffset:0;

    var dx = safeParseInt(obj.style.left) - xOffset- vpX;
    var dy = safeParseInt(obj.style.top) - yOffset - vpY;

    this.slideBy(-dx, -dy);
    return true;
};




/* kaMap.updateObjects
 * call this after any major change to the state of kaMap including after
 * a zoomTo, zoomToExtents, etc.
 */
kaMap.prototype.updateObjects = function()
{
    for (var i=0; i<this.aObjects.length;i++) {
        var obj = this.aObjects[i];
        var xOffset = (obj.xOffset) ? obj.xOffset : 0;
        var yOffset = (obj.yOffset) ? obj.yOffset : 0;

        var aPix = this.geoToPix( obj.lon, obj.lat );
        var top = (aPix[1] + yOffset);
        var left = (aPix[0] + xOffset );
        obj.style.top = top + "px";
        obj.style.left = left + "px";
    }
};



/**
 * kaMap.geoToPix( gX, gY )
 *
 * convert geographic coordinates into pixel coordinates.  Note this does not
 * adjust for the current origin offset that is used to adjust the actual
 * pixel location of the tiles and other images
 *
 * gX - float, the x coordinate in geographic units of the active projection
 * gY - float, the y coordinate in geographic units of the active projection
 *
 * returns an array of pixel coordinates with element 0 being the x and element
 * 1 being the y coordinate.
 */
kaMap.prototype.geoToPix = function( gX, gY ) {
    var gp = new OpenLayers.LonLat(gX, gY);
    gp = gp.transform(this.llProjection, this.getMapProjection());
    var p = this.olMap.getViewPortPxFromLonLat(gp);
    
    return [Math.floor(p.x), Math.floor(p.y)];
};



/**
 * kaMap.pixToGeo( pX, pY [, bAdjust] )
 *
 * convert pixel coordinates into geographic coordinates.  This can optionally
 * adjust for the pixel offset by passing true as the third argument
 *
 * pX - int, the x coordinate in pixel units
 * pY - int, the y coordinate in pixel units
 *
 * returns an array of geographic coordinates with element 0 being the x
 * and element 1 being the y coordinate.
 */
kaMap.prototype.pixToGeo = function( pX, pY ) {
    var bAdjust = (arguments.length == 3 && arguments[2]) ? true : false;

    if (bAdjust) {
        pX = pX + this.xOrigin;
        pY = pY + this.yOrigin;
    } 
    var pos = this.olMap.getLonLatFromPixel(new OpenLayers.Pixel(pX, pY)); 
    pos = pos.transform(this.getMapProjection(), this.llProjection);
    return [pos.lon, pos.lat];
};






/**
 * drawPage - should be called by the user when the application starts or the container
 * layer changes size. If the size of the container layer isn't set, it will be set to
 * the size of the containing window. 
 */
kaMap.prototype.drawPage = function( ) {
  var viewport = this.domObj; 

  var browserHeight = getInsideWindowHeight(); 
  var browserWidth = getInsideWindowWidth();
  viewport.style.width = browserWidth + "px";
  viewport.style.height = browserHeight + "px";

  if(this.olMap) {
    this.olMap.updateSize();
    this.triggerEvent( KAMAP_EXTENTS_CHANGED, this.getGeoExtents() );
  }
};




/**
 * internal function to handle various events that are passed to the
 * current tool. 
 * FIXME: Move to a separate class??? 
 */
kaMap.prototype.onkeypress = function( e ) {
    if (this.currentTool) {
        this.currentTool.onkeypress( e );
    }
    if (this.aInfoTools.length > 0) {
        for (var i=0; i<this.aInfoTools.length; i++) {
            this.aInfoTools[i].onkeypress(e);
        }
    }
};


kaMap.prototype.onmousemove = function( e ) {
    e = (e)?e:((event)?event:null);
    if (e.button==2) {
        this.triggerEvent( KAMAP_CONTEXT_MENU );
    }
    if (this.currentTool) {
        this.currentTool.onmousemove( e );
    }
    if (this.aInfoTools.length > 0) {
        for (var i=0; i<this.aInfoTools.length; i++) {
            this.aInfoTools[i].onmousemove(e);
        }
    }
};


kaMap.prototype.onmousedown = function( e ) { 
    if (this.currentTool) {
        this.currentTool.onmousedown( e );
    }
    if (this.aInfoTools.length > 0) {
        for (var i=0; i<this.aInfoTools.length; i++) {
            this.aInfoTools[i].onmousedown(e);
        }
    }
};


kaMap.prototype.onmouseup = function( e ) {
    if (this.currentTool) {
        this.currentTool.onmouseup( e );
    }
    if (this.aInfoTools.length > 0) {
        for (var i=0; i<this.aInfoTools.length; i++) {
            this.aInfoTools[i].onmouseup(e);
        }
    }
};


kaMap.prototype.onmouseover = function( e ) {
    if (this.currentTool) {
        this.currentTool.onmouseover( e );
    }
    if (this.aInfoTools.length > 0) {
        for (var i=0; i<this.aInfoTools.length; i++) {
            this.aInfoTools[i].onmouseover(e);
        }
    }
};


kaMap.prototype.onmouseout = function( e ) {
     if (this.currentTool) {
        this.currentTool.onmouseout( e );
    }
    if (this.aInfoTools.length > 0) {
        for (var i=0; i<this.aInfoTools.length; i++) {
            this.aInfoTools[i].onmouseout(e);
        }
    }
};


kaMap.prototype.oncontextmenu = function( e ) {
    e = e?e:event;
    if (e.preventDefault) {
        e.preventDefault();
    }
    return false;
};


kaMap.prototype.onclick = function( e ) {
    e = e?e:event;
    if (this.currentTool) {
        this.currentTool.onclick( e );
    }
};


kaMap.prototype.ondblclick = function( e ) {
    if (this.currentTool) {
        this.currentTool.ondblclick( e );
    }
    if (this.aInfoTools.length > 0) {
        for (var i=0; i<this.kaMap.aInfoTools.length; i++) {
            this.aInfoTools[i].ondblclick(e);
        }
    }
};


kaMap.prototype.onmousewheel = function( e ) {
    if (this.currentTool) {
        this.currentTool.onmousewheel( e );
    }
};


kaMap.prototype.cancelEvent = function(e) {
    e = (e)?e:((event)?event:null);
    e.returnValue = false;
    if (e.preventDefault) {
        e.preventDefault();
    }
    return false;
};



kaMap.prototype.registerTool = function( toolObj ) {
    this.aTools.push( toolObj );
};


kaMap.prototype.activateTool = function( toolObj ) {
    if (toolObj.isInfoTool()) {
        this.aInfoTools.push(toolObj);
    } else {
        if (this.currentTool) {
            this.currentTool.deactivate();
        }
        this.currentTool = toolObj;
        if (this.theInsideLayer) {
            this.setCursor(this.currentTool.cursor);
        }
    }
};


kaMap.prototype.deactivateTool = function( toolObj ) {
    if (toolObj.isInfoTool()) {
        for (var i=0; i<this.aInfoTools.length; i++) {
            if (this.aInfoTools[i] == toolObj) {
                this.aInfoTools.splice(i,1);
                break;
            }
        }
    } else {
        if (this.currentTool == toolObj) {
            this.currentTool = null;
        }
        if (this.theInsideLayer) {
            this.theInsideLayer.style.cursor = 'auto';
        }
    }
};


/*
 * inspired by code in WindowManager.js
 * Copyright 2005 MetaCarta, Inc., released under the BSD License
 */
kaMap.prototype.setCursor = function(cursor) {
    if (cursor && cursor.length && typeof cursor == 'object') {
        for (var i = 0; i < cursor.length; i++) {
            this.theInsideLayer.style.cursor = cursor[i];
            if (this.theInsideLayer.style.cursor == cursor[i]) {
                break;
            }
        }
    } else if (typeof cursor == 'string') {
        this.theInsideLayer.style.cursor = cursor;
    } else {
        this.theInsideLayer.style.cursor = 'auto';
    }
};






/**
 * kaMap.getMaps()
 * return an array of predefined map-areas. These can
 * be used to generate controls to switch between those areas.
 */
kaMap.prototype.getMaps = function() {
    return this.aMaps;
};



/**
 * kaMap.getCurrentMap()
 * returns the currently selected map area object. 
 */
kaMap.prototype.getCurrentMap = function() {
  return this.aMaps[this.currentMap];
};




/**
 * kaMap.selectMap( name )
 *
 * select one of the predefined map area and zoom the map to show the area. 
 * This function returns true if name is valid and false if the
 * map is invalid.  
 *
 * name - string, the name of the area to select
 * donZoom - true if we are not to zoom to the extent when selected. 
 */
 
kaMap.prototype.selectMap = function( name, dontZoom )
{   
    OpenLayers.Console.info("selectMap: "+name);
    if (!this.aMaps[name]) {
        OpenLayers.Console.warn("Map area not found: "+name);
        return false;
    } else {
        /* FIXME: This should not be done if extent is given in
         * permalink parameters. Actually we should not call selectMap at all
         */
        this.currentMap = name;
        if (!dontZoom) {
           var v = this.aMaps[name];
           this.zoomToExtents(v.extent[0], v.extent[1], v.extent[2], v.extent[3]);
        }
        return true;
    }
};


kaMap.prototype.getBaseLayer = function() {
    return this.olMap.baseLayer;
};

kaMap.prototype.setBaseLayerId = function(lname) {
    var x = this.olMap.getLayer(lname);
    if (x != null) 
       this.olMap.setBaseLayer(x);
};


kaMap.prototype.getMaxScale = function() {
  /* It seems to work, regardless of the value. But it must be set to
   * something */
   return 5000;
};


kaMap.prototype.getUnits = function() {
   return this.olMap.getUnits();
};




/**
 * kaMap.getGeoExtents()
 *
 * returns an array of geographic extents for the current view in the form
 * (minx, miny, maxx, maxy)
 */
kaMap.prototype.getGeoExtents = function() {
    var b = this.olMap.getExtent()
        .transform(this.getMapProjection(), this.llProjection);
    
    if (b!=null)
       return b.toArray();
    OpenLayers.Console.warn("getGeoExtents: extent is null");
    return [0,0,0,0];   
};


kaMap.prototype.zoomIn = function() {
    this.olMap.zoomIn();
};


kaMap.prototype.zoomOut = function() {
    this.olMap.zoomOut();
};


kaMap.prototype.zoomToScale = function( scale ) {
     this.olMap.zoomToScale(scale);
};


kaMap.prototype.geodeticAdjustment = function() {
    if (/EPSG:(900913|3857|4326)/.test(this.olMap.getProjection()) && this.olMap.getCenter() != null) { 
       var center = this.olMap.getCenter().transform(this.getMapProjection(), "EPSG:4326");
       return Math.cos(center.lat/180*Math.PI ); 
    }
    else
       return 1;
};


kaMap.prototype.getCurrentScale = function() {
    if (this.olMap==null)
       return null;
    return this.olMap.getScale()*this.geodeticAdjustment();
};


kaMap.prototype.registerEventID = function( eventID ) {
    return this.eventManager.registerEventID(eventID);
};


kaMap.prototype.registerForEvent = function( eventID, obj, func ) {
    return this.eventManager.registerForEvent(eventID, obj, func);
};


kaMap.prototype.deregisterForEvent = function( eventID, obj, func ) {
    return this.eventManager.deregisterForEvent(eventID, obj, func);
};


kaMap.prototype.triggerEvent = function( eventID /*pass additional arguments*/ ) {
    return this.eventManager.triggerEvent.apply( this.eventManager, arguments );
};


/**
 * special helper function to parse an integer value safely in case
 * it is represented in IEEE format (scientific notation).
 */
function safeParseInt( val ) {
    return Math.round(parseFloat(val));
};




/*******************************************************************
 * View
 * internal class used to store (possibly user defined) map views
 * (mainly extents)
 * FIXME: Do we need this? Use objects directly from mapconfig?
 *******************************************************************/
 
 function View(o) {
    this.name = (typeof(o.name) != 'undefined') ? o.name : 'noname';
    this.title = (typeof(o.title) != 'undefined') ? o.title : 'no title';
    this.extent = (typeof(o.extent) != 'undefined') ? o.extent:[];
    this.hidden = (typeof(o.hidden) != 'undefined') ? o.hidden : false;
 }
 


