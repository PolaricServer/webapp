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
 * Copyright (c) 2009, Øyvind Hanssen, LA7ECA (ohanssen@acm.org)
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
    this.isCSS = false;
    this.isW3C = false;
    this.isIE4 = false;
    this.isNN4 = false;
    this.isIE6CSS = false;

    if (document.images) {
        this.isCSS = (document.body && document.body.style) ? true : false;
        this.isW3C = (this.isCSS && document.getElementById) ? true : false;
        this.isIE4 = (this.isCSS && document.all) ? true : false;
        this.isNN4 = (document.layers) ? true : false;
        this.isIE6CSS = (document.compatMode && document.compatMode.indexOf("CSS1") >= 0) ? true : false;
    }

    this.domObj = this.getRawObject( szID );
    this.domObj.style.overflow = 'hidden';

    this.hideLayersOnMove = false;
    //if true layer not checked are loaded if false aren't loaded
    this.loadUnchecked=false;
    /**
     * initialization states
     * 0 - not initialized
     * 1 - initializing
     * 2 - initialized
     */
    this.initializationState = 0;

    //track mouse down events
    this.bMouseDown = false;

    //track last recorded mouse position
    this.lastx = 0;
    this.lasty = 0;

    //keep a reference to the inside layer since we use it a lot
    this.theInsideLayer = null;

    //viewport width and height are used in many calculations
    this.viewportWidth = this.getObjectWidth(this.domObj);
    this.viewportHeight = this.getObjectHeight(this.domObj);

    //track amount the inside layer has moved to help in wrapping images
    this.xOffset = 0;
    this.yOffset = 0;

    /* the name of the current map. 
       FIXME: is this needed? */
    this.currentMap = '';

    //the current width and height in tiles
    this.nWide = 0;
    this.nHigh = 0;

    //current top and left are tracked when the map moves
    //to start the map at some offset, these would be set to
    //the appropriate pixel value.
    this.nCurrentTop = 0; //null;
    this.nCurrentLeft = 0; //null;

    //an array of available maps. Consider changing name to aViews
    this.aMaps = new Array(); 
    
    
    //size of a pixel, geographically - assumed to be square
    this.cellSize = null;
    
    //event manager
    this.eventManager = new _eventManager();

    //slider stuff
    this.as=slideid=null;
    this.accelerationFactor=1;
    this.pixelsPerStep = 30;
    this.timePerStep = 25;

    //this is a convenience to allow redirecting the client code to a server
    //other than the one that this file was loaded from.  This may not
    //work depending on security settings, except for loading tiles since
    //those come directly from a php script instead of an XmlHttpRequest.
    //
    //by default, if this is empty, it loads from the same site as the
    //page loaded from.  If set, it should be a full http:// reference to the
    //directory in which init.php, tile.php and the other scripts are located.
    this.server = this.server = server_url ? server_url : '';

    //similarly, this is the global initialization script called once per page
    //load ... the result of this script tell the client what other scripts
    //are used for the other functions
    this.init = "KaMap/init.php";

    //these are the values that need to be initialized by the init script
    this.tileURL = null;

    this.aObjects = [];
    this.aCanvases = [];
    this.layersHidden = false;

    this.aTools = [];
    this.aInfoTools = [];

    /* register the known events */
    for (var i=0; i<gnLastEventId; i++) {
        this.registerEventID( i );
    }
    
    this.thandler = new touchHandler();
    this.createLayers();
};
 
 
 

kaMap.prototype.getMapProjection = function()
{
   return this.olMap.getProjectionObject();
}




kaMap.prototype.getResolution = function()
{
    return this.olMap.getResolution();
}



kaMap.prototype.seekLayer = function(doc, name) {
    var theObj;
    for (var i = 0; i < doc.layers.length; i++) {
        if (doc.layers[i].name == name) {
            theObj = doc.layers[i];
            break;
        }
        // dive into nested layers if necessary
        if (doc.layers[i].document.layers.length > 0) {
            theObj = this.seekLayer(document.layers[i].document, name);
        }
    }
    return theObj;
};


/**
 * kaMap.initialize( [szMap] )
 *
 * main initialization of kaMap.  This must be called after page load and
 * should only be called once (i.e. on page load).  It does not perform
 * intialization synchronously.  This means that the function will return
 * before initialization is complete.  To determine when initialization is
 * complete, the calling application must register for the KAMAP_INITIALIZED
 * event.
 *
 * szMap - string, optional, the name of a map to initialize by default.  If
 *         not set, use the default configuration map file.
 *
 * returns true
 */
kaMap.prototype.initialize = function() {
    if (this.initializationState == 2) {
        this.triggerEvent( KAMAP_ERROR, 'ERROR: ka-Map! is already initialized!' );
        return false;
    } else if (this.intializationState == 1) {
        this.triggerEvent( KAMAP_WARNING, 'WARNING: ka-Map! is currently initializing ... wait for the KAMAP_INITIALIZED event to be triggered.' );
        return false;
    }
    this.initializationState = 1;
    /* call initialization script on the server */
    var szURL = this.server+this.init;

    var sep = (this.init.indexOf("?") == -1) ? "?" : "&";

    if (arguments.length > 0 && arguments[0] != '') {
        szURL = szURL + sep + "map="+ arguments[0];
        sep = "&";
    }
    if (arguments.length > 1 && arguments[1] != '') {
        szURL = szURL + sep + "extents="+ arguments[1];
        sep = "&";
    }
    if (arguments.length > 2 && arguments[2] != '') {
        szURL = szURL + sep + "centerPoint="+ arguments[2];
        sep = "&";
    } 
    if (use_kaMap_maps) 
         call(szURL, this, this.initializeCallback);
    else
         this.initializeCallback(null);
    return true;
};


/**
 * hidden function on callback from init.php
 */
kaMap.prototype.initializeCallback = function( szInit ) 
{
    // szInit contains /*init*/ if it worked, or some php error otherwise
    if (use_kaMap_maps && szInit.substr(0, 1) != "/") {
        this.triggerEvent( KAMAP_ERROR, 'ERROR: ka-Map! initialization '+
                          'failed on the server.  Message returned was:\n' +
                          szInit);
        return false;
    }
    
    /*
     * OpenLayers integration.
     * The options and the layers are defined in mapconfig.js
     */
    this.olMap = new OpenLayers.Map(mapOptions);
    this.utmProjection = utm_projection;

    /* map OpenLayers events to kaMap events */
    function zoomEnd() {
       this.triggerEvent(KAMAP_SCALE_CHANGED, this.getCurrentScale());
       this.triggerEvent(KAMAP_EXTENTS_CHANGED, this.getGeoExtents());
    }
    function moveEnd() {
       mousetrack_suspend = false;
       this.triggerEvent(KAMAP_EXTENTS_CHANGED, this.getGeoExtents());
       this.triggerEvent(KAMAP_MOVE_END); 
    }
    function moveStart() {
       mousetrack_suspend = true;
       this.triggerEvent(KAMAP_MOVE_START);
    }

    function layerChange() {
       this.triggerEvent(KAMAP_LAYERS_CHANGED);
    }
    
    
    /* Remove null layers */
    while (true) {
      for (idx=0; idx<baseLayers.length; idx++) 
         if (baseLayers[idx] == null)
            break;
      if (idx < baseLayers.length)
          baseLayers.splice(idx,1);
      else break;
    }
    
    
    /* Get baselayers from kaMap backend */
    if (use_kaMap_maps && kaMapFirst)
        eval(szInit);
    if (baseLayers != null && baseLayers.length > 0)
        this.olMap.addLayers(baseLayers);
    if (use_kaMap_maps && !kaMapFirst)
        eval(szInit);
    
    
    
    /* OL controls, Permalink setup, etc.. */  
    this.olMap.events.register("changebaselayer", this, layerChange);
    this.olMap.events.register("zoomend", this, zoomEnd);
    this.olMap.events.register("moveend", this, moveEnd);
    this.olMap.events.register("movestart", this, moveStart);
    if (!isMobile) 
         this.olMap.addControl( new OpenLayers.Control.PanZoomBar() );
    this.olMap.addControl( new OpenLayers.Control.LayerSwitcher() );
    this.plink = new OpenLayers.Control.Permalink();
    this.plink.setMap(this.olMap);  
    
    
    /* Map views */
    for (var i = 0; i < mapViews.length; i++) {
        var x = new View (mapViews[i]);
        this.aMaps[x.name] = x;
    }
    
    this.triggerEvent( KAMAP_MAP_INITIALIZED );
    this.olMap.render(this.domObj);   

    
    var cont = document.getElementsByTagName("div");
    var elem; 
    while (elem = cont[i++]) 
       if (elem.className != null && elem.className.match(/olMapViewport/) != null) 
          break;
    
    if (elem.className != null && elem.className.match(/olMapViewport/) != null) {
        var elem = elem.firstChild;
        elem.appendChild(this.theInsideLayer);
    }
    else
        alert("ERROR: Can't find OpenLayers Viewport element");
    
    document.getElementById('permolink').appendChild(this.plink.draw());
    this.plink.element.innerHTML="link to this view";    
    this.setBackgroundColor( backgroundColor ); 

    this.triggerEvent( KAMAP_INITIALIZED );
    this.triggerEvent( KAMAP_SCALE_CHANGED, this.getCurrentScale());
    this.initializationState = 2;      

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
    
    // this.domObj.appendChild(this.theInsideLayer);
    this.domObj.kaMap = this;
    this.theInsideLayer.onclick = kaMap_onclick;
    this.theInsideLayer.onmousedown = kaMap_onmousedown;
    this.theInsideLayer.onmouseup = kaMap_onmouseup;
    this.theInsideLayer.onmousemove = kaMap_onmousemove;
    this.theInsideLayer.onmouseover = kaMap_onmouseover;
    this.domObj.onmouseout = kaMap_onmouseout;
    this.theInsideLayer.onkeypress = kaMap_onkeypress;
    this.theInsideLayer.ondblclick = kaMap_ondblclick;
    this.theInsideLayer.oncontextmenu = kaMap_oncontextmenu;
    this.theInsideLayer.onmousewheel = kaMap_onmousewheel;
    
        /* Map touch events */
    this.theInsideLayer.ontouchstart = this.thandler.handle;
    this.theInsideLayer.ontouchmove = this.thandler.handle;
    this.theInsideLayer.ontouchend = this.thandler.handle;
    this.theInsideLayer.ontouchcancel = this.thandler.handle;
    
    if (window.addEventListener)
        this.domObj.addEventListener( "DOMMouseScroll", kaMap_onmousewheel, false );


    //this is to prevent problems in IE
    // FIXME: Is this needed? I dont care about IE6 and 7 anymore!!
    this.theInsideLayer.ondragstart = new Function([], 'var e=e?e:event;e.cancelBubble=true;e.returnValue=false;return false;');
    this.olMap = null;
};


kaMap.prototype.showLayers = function() {}
kaMap.prototype.hideLayers = function() {}
kaMap.prototype.getPlink = function() {return this.plink; }


// Convert object name string or object reference
// into a valid element object reference
kaMap.prototype.getRawObject = function(obj) {
    var theObj;
    if (typeof obj == "string") {
        if (this.isW3C) {
            theObj = document.getElementById(obj);
        } else if (this.isIE4) {
            theObj = document.all(obj);
        } else if (this.isNN4) {
            theObj = seekLayer(document, obj);
        }
    } else {
        // pass through object reference
        theObj = obj;
    }
    return theObj;
};



// Convert object name string or object reference
// into a valid style (or NN4 layer) reference
kaMap.prototype.getObject = function(obj) {
    var theObj = this.getRawObject(obj);
    if (theObj && this.isCSS) {
        theObj = theObj.style;
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
 * kaMap.zoomTo( lon, lat [, scale] )
 *
 * zoom to some geographic point (in current projection) and optionally scale
 *
 * lon - the x coordinate to zoom to
 * lat - the y coordinate to zoom to
 * scale - optional. The scale to use
 */
kaMap.prototype.zoomTo = function( x, y ) {
     var p = new OpenLayers.LonLat(x, y);
     p.transform(this.utmProjection, this.getMapProjection());
     this.olMap.setCenter(p);
};



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
      b.transform(this.utmProjection, this.getMapProjection());
      this.olMap.zoomToExtent(b, true);
};



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
    d.style.width= '3000px';
    d.style.height = '3000px';
    d.style.zIndex = idx;
    this.theInsideLayer.appendChild( d );
    
    if (bg) {
      var db = document.createElement( 'div' );
      db.id = 'canvasBG';
      db.style.marginLeft = '-50%';
      db.style.marginTop = '-50%';
      db.style.width='150%';
      db.style.height='150%';
      d.appendChild(db);
    }
     
    this.aCanvases.push( d );
    d.kaMap = this;
    return d;
};


kaMap.prototype.updateDrawingCanvas = function( canvas ) {
    this.theInsideLayer.removeChild(canvas);
    this.theInsideLayer.appendChild(canvas);
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
 * position.  This is defined as being in the projection of the map.
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
    gp = gp.transform(this.utmProjection, this.getMapProjection());
    var p = this.olMap.getPixelFromLonLat(gp);
    
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
    pos = pos.transform(this.getMapProjection(), this.utmProjection);
    return [pos.lon, pos.lat];
};




/**
 * kaMap.resize()
 *
 * called when the viewport layer changes size.  It is the responsibility
 * of the user of this API to track changes in viewport size and call this
 * function to update the map
 */
kaMap.prototype.resize = function( ) {
    if(this.olMap) {
       this.olMap.updateSize();
       this.triggerEvent( KAMAP_EXTENTS_CHANGED, this.getGeoExtents() );
    }
};




/**
 * internal function to handle various events that are passed to the
 * current tool
 */
kaMap_onkeypress = function( e ) {
    if (this.kaMap.currentTool) {
        this.kaMap.currentTool.onkeypress( e );
    }
    if (this.kaMap.aInfoTools.length > 0) {
        for (var i=0; i<this.kaMap.aInfoTools.length; i++) {
            this.kaMap.aInfoTools[i].onkeypress(e);
        }
    }
};


kaMap_onmousemove = function( e ) {
    e = (e)?e:((event)?event:null);
    if (e.button==2) {
        this.kaMap.triggerEvent( KAMAP_CONTEXT_MENU );
    }
    if (this.kaMap.currentTool) {
        this.kaMap.currentTool.onmousemove( e );
    }
    if (this.kaMap.aInfoTools.length > 0) {
        for (var i=0; i<this.kaMap.aInfoTools.length; i++) {
            this.kaMap.aInfoTools[i].onmousemove(e);
        }
    }
};


kaMap_onmousedown = function( e ) { 
    if (this.kaMap.currentTool) {
        this.kaMap.currentTool.onmousedown( e );
    }
    if (this.kaMap.aInfoTools.length > 0) {
        for (var i=0; i<this.kaMap.aInfoTools.length; i++) {
            this.kaMap.aInfoTools[i].onmousedown(e);
        }
    }
};


kaMap_onmouseup = function( e ) {
    if (this.kaMap.currentTool) {
        this.kaMap.currentTool.onmouseup( e );
    }
    if (this.kaMap.aInfoTools.length > 0) {
        for (var i=0; i<this.kaMap.aInfoTools.length; i++) {
            this.kaMap.aInfoTools[i].onmouseup(e);
        }
    }
};


kaMap_onmouseover = function( e ) {
    if (this.kaMap.currentTool) {
        this.kaMap.currentTool.onmouseover( e );
    }
    if (this.kaMap.aInfoTools.length > 0) {
        for (var i=0; i<this.kaMap.aInfoTools.length; i++) {
            this.kaMap.aInfoTools[i].onmouseover(e);
        }
    }
};


kaMap_onmouseout = function( e ) {
     if (this.kaMap.currentTool) {
        this.kaMap.currentTool.onmouseout( e );
    }
    if (this.kaMap.aInfoTools.length > 0) {
        for (var i=0; i<this.kaMap.aInfoTools.length; i++) {
            this.kaMap.aInfoTools[i].onmouseout(e);
        }
    }
};


kaMap_oncontextmenu = function( e ) {
    e = e?e:event;
    if (e.preventDefault) {
        e.preventDefault();
    }
    return false;
};


kaMap_onclick = function( e ) {
    e = e?e:event;
    if (this.kaMap.currentTool) {
        this.kaMap.currentTool.onclick( e );
    }
};


kaMap_ondblclick = function( e ) {
    if (this.kaMap.currentTool) {
        this.kaMap.currentTool.ondblclick( e );
    }
    if (this.kaMap.aInfoTools.length > 0) {
        for (var i=0; i<this.kaMap.aInfoTools.length; i++) {
            this.kaMap.aInfoTools[i].ondblclick(e);
        }
    }
};


kaMap_onmousewheel = function( e ) {
    if (this.kaMap.currentTool) {
        this.kaMap.currentTool.onmousewheel( e );
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
 * kaMap.addMap( oMap )
 *
 * add a new instance of _map to kaMap.  _map is an internal class that
 * represents a map file from the configuration file.  This function is
 * intended for internal use by the init.php script.
 *
 * oMap - object, an instance of _map
 */
 
kaMap.prototype.addMap = function( oMap ) {

        if (!use_kaMap_maps)
           return;
        
        OpenLayers.Console.info("addMap: ", oMap.name);   
        // straight from original kaMap.js
        oMap.kaMap = this;
        if (getViewsFromKaMap) {
            this.aMaps[oMap.name] = new View(oMap.name, oMap.title, oMap.defaultExtents); 
        }  
        
        // add all layers
        var kaLayer, olLayer, options, scales;
        for(var layerIndex=0; layerIndex<oMap.aLayers.length; ++layerIndex)
        {
            kaLayer = oMap.aLayers[layerIndex];
            scales = [];
            for(var scaleIndex=0; scaleIndex<oMap.aScales.length; ++scaleIndex) {
                if(kaLayer.scales[scaleIndex] == '1') {
                    scales.push(oMap.aScales[scaleIndex]);
                }
            }
  
            olLayer = new OpenLayers.Layer.KaMap
                  (  oMap.title+" (ka-map)", this.server+"KaMap/tile.php",
                     { i: kaLayer.imageformat,
                       g: kaLayer.name,
                       map: oMap.name },
                     { scales: scales, buffer: 2 } );
            this.olMap.addLayer(olLayer);
        }

};





/**
 * kaMap.getMaps()
 *
 * return an array of all the _map objects that kaMap knows about.  These can
 * be used to generate controls to switch between maps and to get information
 * about the layers (groups) and scales available in a given map.
 */
kaMap.prototype.getMaps = function() {
    return this.aMaps;
};


/**
 * kaMap.getCurrentMap()
 *
 * returns the currently selected _map object.  This can be used to get
 * information about the layers (groups) and scales available in the current
 * map.
 */
kaMap.prototype.getCurrentMap = function() {
    return this.aMaps[this.currentMap];
};




/**
 * kaMap.selectMap( name )
 *
 * select one of the maps that kaMap knows about and re-initialize kaMap with
 * this new map.  This function returns true if name is valid and false if the
 * map is invalid.  Note that a return of true does not imply that the map is
 * fully active.  You must register for the KAMAP_MAP_INITIALIZED event since
 * the map initialization happens asynchronously.
 *
 * name - string, the name of the map to select
 * zoom - (optional) array of 3 (centerx, centery, scale) or 4 (minx, miny,
 *        maxx,maxy) values to zoom to.
 */


 
kaMap.prototype.selectMap = function( name, dontZoom )
{   
    OpenLayers.Console.info("selectMap: "+name);
    if (!this.aMaps[name]) {
        OpenLayers.Console.warn("Map view not found: "+name);
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
    return this.olMap.baseLayer.id;
};

kaMap.prototype.setBaseLayer = function(lname) {
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
 * (inx, miny, maxx, maxy)
 */
kaMap.prototype.getGeoExtents = function() {
    var b = this.olMap.getExtent();
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


kaMap.prototype.zoomByFactor = function( nZoomFactor ) {
      throw "zoomByFactor not implemented";
};


kaMap.prototype.getCurrentScale = function() {
    return this.olMap==null ? null : this.olMap.getScale();
};



kaMap.prototype.setLayerQueryable = function( name, bQueryable ) {
    this.aMaps[this.currentMap].setLayerQueryable( name, bQueryable );
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
 *******************************************************************/
 
 function View(o) {
    this.name = (typeof(o.name) != 'undefined') ? o.name : 'noname';
    this.title = (typeof(o.title) != 'undefined') ? o.title : 'no title';
    this.extent = (typeof(o.extent) != 'undefined') ? o.extent:[];
 }
 


/******************************************************************************
 * _map
 *
 * internal class used to store map objects coming from the init script
 *
 * szName - string, the layer name (or group name, in this case ;))
 *
 * szTitle - string, the human-readable title of the map
 *
 * nCurrentScale - integer, the current scale as an index into aszScales;
 *
 * aszScales - array, an array of scale values for zooming.  The first scale is
 *             assumed to be the default scale of the map
 *
 * aszLayers - array, an array of layer names and statuses.  The array is indexed by
 *             the layer name and the value is true or false for the status.
 *
 *****************************************************************************/

function _map(o) {
    this.aLayers = [];
    this.aZoomTo = [];
    this.kaMap = null;
    this.name = (typeof(o.name) != 'undefined') ? o.name : 'noname';
    this.title = (typeof(o.title) != 'undefined') ? o.title : 'no title';
    this.aScales = (typeof(o.scales) != 'undefined') ? o.scales : [1];
    this.currentScale = (typeof(o.currentScale) != 'undefined') ? parseFloat(o.currentScale) : 0;
    this.units = (typeof(o.units) != 'undefined') ? o.units : 5;
    this.resolution = (typeof(o.resolution) != 'undefined') ? o.resolution:72; //used in scale calculations
    this.defaultExtents = (typeof(o.defaultExtents) != 'undefined') ? o.defaultExtents:[];
    this.currentExtents = (typeof(o.currentExtents) != 'undefined') ? o.currentExtents:[];
    this.maxExtents = (typeof(o.maxExtents) != 'undefined') ? o.maxExtents : [];
    this.backgroundColor = (typeof(o.backgroundColor) != 'undefined') ? o.backgroundColor : '#ffffff';
    //to be used for versioning the map file ...
    this.version = (typeof(o.version) != 'undefined') ? o.version : "";
};

_map.prototype.addLayer = function( layer ) {
    layer._map = this;
    layer.zIndex = this.aLayers.length;
    this.aLayers.push( layer );
};

//added by cappu
_map.prototype.removeLayer = function( l ) {
  var alayer=Array();
  for(i=0,a=0;i<this.aLayers.length;i++) {
      if(this.aLayers[i]!=l) {
          alayer[a]=this.aLayers[i];
          a++;
      }
  }
  this.aLayers=alayer;
  return true;
};

//modified by cappu return only layer querable and visible for current scale
_map.prototype.getQueryableLayers = function() {
    var r = [];
    var l = this.getLayers();
    for( var i=0; i<l.length; i++) {
        if (l[i].isQueryable()) {
            r.push(l[i]);
        }
    }
    return r;
};

//modified by cappu, return only layer visible and checked for current scale !!
_map.prototype.getLayers = function() {
    var r = [];
    for( var i=0; i<this.aLayers.length; i++) {
        if (this.aLayers[i].isVisible() &&
            (this.aLayers[i].visible || this.kaMap.loadUnchecked) ) {
            r.push(this.aLayers[i]);
        }
    }
    return r;
};

//added by cappu replace old getQueryableLayers
_map.prototype.getAllQueryableLayers = function() {
    var r = [];
    for( var i=0; i<this.aLayers.length; i++) {
        if (this.aLayers[i].isQueryable()) {
            r.push(this.aLayers[i]);
        }
    }
    return r;
};

//added by cappu replace old getLayers
_map.prototype.getAllLayers = function() {
    return this.aLayers;
};

_map.prototype.getLayer = function( name ) {
    for (var i=0; i<this.aLayers.length; i++) {
        if (this.aLayers[i].name == name) {
            return this.aLayers[i];
        }
    }
};

_map.prototype.getScales = function() {
    return this.aScales;
};



_map.prototype.setLayerQueryable = function( name, bQueryable ) {
    var layer = this.getLayer( name );
    if(typeof(layer) != 'undefined') {
        layer.setQueryable( bQueryable );
    }
};


_map.prototype.setDefaultExtents = function( minx, miny, maxx, maxy ){
    this.defaultExtents = [minx, miny, maxx, maxy];
    if (this.currentExtents.length == 0)
        this.setCurrentExtents( minx, miny, maxx, maxy );
};

_map.prototype.setCurrentExtents = function( minx, miny, maxx, maxy ) {
    this.currentExtents = [minx, miny, maxx, maxy];
};

_map.prototype.setMaxExtents = function( minx, miny, maxx, maxy ) {
    this.maxExtents = [minx, miny, maxx, maxy];
};

_map.prototype.setBackgroundColor = function( szBgColor ) {
    this.backgroundColor = szBgColor;
};




/******************************************************************************
 * _layer
 *
 * internal class used to store map layers within a map.  Map layers track
 * visibility of the layer in the user interface.  Parameters are passed
 * as an object with the following attributes:
 *
 * name - string, the name of the layer
 * visible - boolean, the current state of the layer (true is visible)
 * opacity - integer, between 0 (transparent) and 100 (opaque), controls opacity
 *           of the layer as a whole
 * imageformat - string, the format to request the tiles in for this layer.  Can
 *               be used to optimize file sizes for different layer types
 *               by using GIF for images with fewer colours and JPEG or PNG24
 *               for high-colour layers (such as raster imagery).
 *
 * queryable - boolean, is the layer queryable?  This is different from the
 *              layer being included in queries.  bQueryable marks a layer as
 *              being capable of being queried.  The layer also has to have
 *              it's query state turned on using setQueryable
 * scales     - array to containing the layer visibility for each scale
 * force    - force layer
 *****************************************************************************/
function _layer( o ) {
    this.domObj = null;
    this._map = null;
    this.name = (typeof(o.name) != 'undefined') ? o.name : 'unnamed';
    this.queryable = (typeof(o.queryable) != 'undefined') ? o.queryable : false;
    this.queryState = (typeof(o.queryable) != 'undefined') ? o.queryable : false;
    this.tileSource = (typeof(o.tileSource) != 'undefined') ? o.tileSource : 'auto';
    this.scales = (typeof(o.scales) != 'undefined') ? o.scales : new Array(1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1);
    this.toLoad=0;

};

_layer.prototype.isQueryable = function() {
    return this.queryState;
};

_layer.prototype.setQueryable = function( bQueryable ) {
    if (this.queryable) {
        this.queryState = bQueryable;
    }
};


_layer.prototype.setZIndex = function( zIndex ) {
    this.zIndex = zIndex;
    if (this.domObj) {
        this.domObj.style.zIndex = zIndex;
    }
};



/******************************************************************************
 * Event Manager class
 *
 * an internal class for managing generic events.  kaMap! uses the event
 * manager internally and exposes certain events to the application.
 *
 * the kaMap class provides wrapper functions that hide this implementation
 * useage:
 *
 * myKaMap.registerForEvent( gnSomeEventID, myObject, myFunction );
 * myKaMap.registerForEvent( 'SOME_EVENT', myObject, myFunction );
 *
 * myKaMap.deregisterForEvent( gnSomeEventID, myObject, myFunction );
 * myKaMap.deregisterForEvent( 'SOME_EVENT', myObject, myFunction );
 *
 * myObject is normally null but can be a javascript object to have myFunction
 * executed within the context of an object (becomes 'this' in the function).
 *
 *****************************************************************************/
function _eventManager( )
{
    this.events = [];
    this.lastEventID = 0;
}

_eventManager.prototype.registerEventID = function( eventID ) {
    var ev = new String(eventID);
    if (!this.events[eventID]) {
        this.events[eventID] = [];
    }
};

_eventManager.prototype.registerForEvent = function(eventID, obj, func) {
    var ev = new String(eventID);
    this.events[eventID].push( [obj, func] );
};

_eventManager.prototype.deregisterForEvent = function( eventID, obj, func ) {
    var ev = new String(eventID);
    var bResult = false;
    if (!this.events[eventID]) {
        return false;
    }

    for (var i=0;i<this.events[eventID].length;i++) {

        if (this.events[eventID][i][0] == obj &&
            this.events[eventID][i][1] == func) {
            this.events[eventID].splice(i,1);
            bResult = true;
        }
    }
    return bResult;
};

_eventManager.prototype.triggerEvent = function( eventID ) {
    var ev = new String(eventID);
    if (!this.events[eventID]) {
        return false;
    }

    var args = new Array();
    for(i=1; i<arguments.length; i++) {
        args[args.length] = arguments[i];
    }

    for (var i=0; i<this.events[eventID].length; i++) {
        this.events[eventID][i][1].apply( this.events[eventID][i][0],
                                          arguments );
    }
    return true;
};

/******************************************************************************
 * Queue Manager class
 *
 * an internal class for managing delayed execution of code.  This uses the
 * window.setTimeout interface but adds support for execution of functions
 * on objects
 *
 * The problem with setTimeout is that you need a reference to a global object
 * to do something useful in an object-oriented environment, and we don't
 * really have that here.  So the Queue Manager handles a stack of pending
 * delayed execution code and evaluates it when it comes due.  It can be
 * used exactly like window.setTimeout in that it returns an id that can
 * subsequently be used to clear the delayed code.
 *
 * To add something to the queue, call
 * var id = goQueueManager.enqueue( timeout, obj, func, args );
 *
 * timeout - time to delay (milliseconds)
 * obj - the object to execute the function within.  Can be null for global
 *       scope
 * func - the function to execute.  Note this is the function, not a string
 *        containing the function.
 * args - an array of values to be passed to the function.
 *
 * To remove a function from the queue, call goQueueManager.dequeue( id );
 *****************************************************************************/
var goQueueManager = new _queueManager();

function _queueManager() {
    this.queue = new Array();
}

_queueManager.prototype.enqueue = function( timeout, obj, func, args ) {
    var pos = this.queue.length;
    for (var i=0; i< this.queue.length; i++) {
        if (this.queue[i] == null) {
            pos = i;
            break;
        }
    }
    var id = window.setTimeout( "_queueManager_execute("+pos+")", timeout );
    this.queue[pos] = new Array( id, obj, func, args );
    return pos;
};

_queueManager.prototype.dequeue = function( pos ) {
    if (this.queue[pos] != null) {
        window.clearTimeout( this.queue[pos][0] );
        this.queue[pos] = null;
    }
};

function _queueManager_execute( pos) {
    if (goQueueManager.queue[pos] != null) {
        var obj = goQueueManager.queue[pos][1];
        var func = goQueueManager.queue[pos][2];
        if (goQueueManager.queue[pos][3] != null) {
            func.apply( obj, goQueueManager.queue[pos][3] );
        } else {
            func.apply( obj );
        }
        goQueueManager.queue[pos] = null;
    }
};
