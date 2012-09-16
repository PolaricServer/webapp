/******************************************************************************
 * kaXmlOverlay - XML server side generated overlay for kaMap.
 *
 * Based on code by
 *   Piergiorgio Navone 
 * Modifications/additions/removals by 
 *   Øyvind Hanssen, LA7ECA
 *
 * $Id: kaXmlOverlay.js,v 1.3 2007-09-15 17:47:19 oivindh Exp $
 *****************************************************************************/


/* TODO: These global variables/functions should be inside the scope
 * of the kaXmlOverlay object 
 */
 
var zzindex;                 
var _sstorage = null;

function setSesStorage(s)
{ _sstorage = s; }



function toggleTracked ( tr) {
    var tracked = _sstorage['polaric.tracked'];
    if (tracked != null)
        clearTracking(tracked);
    if (tr == tracked) 
        _sstorage['polaric.tracked'] = null;
    else {
        _sstorage['polaric.tracked'] = tr;
        setTracking(tr);
    } 
}

function setTracking(tr) 
   {  x = document.getElementById(tr+"_label_txt"); 
      if (x==null) return;
      _sstorage['polaric.trackedOrigStyle'] = x.className;
      x.className += " tracked";
   }


function clearTracking(tr) 
   {  x = document.getElementById(tr+"_label_txt");
      if (x==null) return;
      x.className = _sstorage['polaric.trackedOrigStyle'];
   }


function isTracked(tr) 
   { return (tr == _sstorage['polaric.tracked']); }



function hidePointLabel(ident)
{
   _sstorage['polaric.hidelabel.'+ident] = 'T';
   var elem = document.getElementById(ident+'_label_txt');
   if (elem != null)
      elem.style.visibility = 'hidden';
}
   
   
function showPointLabel(ident)
{ 
   _sstorage['polaric.hidelabel.'+ident] = null;
   var elem = document.getElementById(ident+'_label_txt');
   if (elem!=null)
      elem.style.visibility = 'visible';
}


function labelIsHidden(ident) 
  { return _sstorage['polaric.hidelabel.'+ident] == 'T'; }
  
  
  
  
function hasTrace(ident)
 { return (document.getElementById(ident+'_trace')!=null) ; }



kaXmlOverlay.prototype._setPointTrace = function (ident, hide)
{
   function _setElemTrace(ident, hide)
   {
      var elem = document.getElementById(ident+'_trace');
      if (elem != null)
        elem.style.visibility = (hide ? 'hidden' : 'visible');
   }

   if (ident == 'ALL')
      for (var i=0; i < this.ovrObjects.length; i++) 
        _setElemTrace(this.ovrObjects[i].pid, hide);     
   else {
       if (_sstorage['polaric.hidetrace.ALL'] == 'T')
          return;
       _setElemTrace(ident, hide);       
   }
   _sstorage['polaric.hidetrace.'+ident] = (hide ? 'T' : null);
}


kaXmlOverlay.prototype.hidePointTrace = function (ident)
  { this._setPointTrace(ident, true); }


kaXmlOverlay.prototype.showPointTrace = function (ident)
  { this._setPointTrace(ident, false); }



function traceIsHidden(ident) 
  { return _sstorage['polaric.hidetrace.'+ident] == 'T'; }


/**
 * kaXmlOverlay( oKaMap, xml_url )
 *
 * oKaMap       A kaMap object
 * zIndex       The z index of the layer
 */
function kaXmlOverlay( oKaMap, zIndex )
{
    kaTool.apply( this, [oKaMap] );
    this.name = 'kaXmlOverlay';
    this.postLoadXml = null;  
    this.meta = new Array(); 
    this.seq = -1;


    for (var p in kaTool.prototype)
    {
        if (!kaXmlOverlay.prototype[p]) 
            kaXmlOverlay.prototype[p]= kaTool.prototype[p];
    }
    
    this.urlBase = this.kaMap.server;
    this.urlBase += (this.urlBase!=''&&this.urlBase.substring(-1)!='/')?'':'/';

    // The list of overlay points
    this.ovrObjects = new Array();   
    
    // The canvas of the overlay layer
    zzindex = this.z_index = zIndex;
    this.overlayCanvas = this.kaMap.createDrawingCanvas( zIndex, true );
    
    // Register for events
    this.kaMap.registerForEvent( KAMAP_SCALE_CHANGED, this, this.scaleChanged );
}



/* Is is possible we do not need this stuff */
kaXmlOverlay.prototype.scaleChanged = function( eventID, mapName ) {
        if (this.ovrObjects == null) return;
        for (var i=0; i < this.ovrObjects.length; i++) {
                if (this.ovrObjects[i]) this.ovrObjects[i].rescale();
        }
}




/**
 * Remove the overlay layer and free resources user by overlay objects.
 */
kaXmlOverlay.prototype.remove = function() {
    this.kaMap.deregisterForEvent( KAMAP_SCALE_CHANGED, this, this.scaleChanged );
        this.removePoint();
        this.kaMap.removeDrawingCanvas(this.overlayCanvas);
}



/**
 * Load XML from the server and update the overlay.
 *
 * xml_url      URL of th XML with points to plot
 */
kaXmlOverlay.prototype.loadXml = function(xml_url) {
      return call(xml_url, this, this.loadXmlCallback, true); 
}



/**
 * Defines the DOMParser object for IE
 */
if (typeof DOMParser == "undefined") {
   DOMParser = function () {}

   DOMParser.prototype.parseFromString = function (str, contentType) {
      if (typeof ActiveXObject != "undefined") {
         var d = new ActiveXObject("MSXML.DomDocument");
         d.loadXML(str);
         return d;
      } else if (typeof XMLHttpRequest != "undefined") {
         var req = new XMLHttpRequest;
         req.open("GET", "data:" + (contentType || "application/xml") +
                         ";charset=utf-8," + encodeURIComponent(str), false);
         if (req.overrideMimeType) {
            req.overrideMimeType(contentType);
         }
         req.send(null);
         return req.responseXML;
      }
   }
}



kaXmlOverlay.prototype.loadXmlCallback = function(xml_string) {
  if (xml_string == null)
    postLoadXml_Fail(); 
  else if (this.loadXmlDoc(xml_string))
    postLoadXml(); 
}



var lastOvrSeq = 0;
kaXmlOverlay.prototype.loadXmlDoc = function(xml_string) 
{     
        if (xml_string.length < 10)
           return false;
        var xmlDocument =  (new DOMParser()).parseFromString(xml_string, "text/xml");
        var objDomTree = xmlDocument.documentElement;
        var cancel = objDomTree.getAttribute("cancel");
        var reboot = objDomTree.getAttribute("reboot");
        if (reboot && reboot == "true") {
           setTimeout(function() { window.location.reload(); }, 25000);
           return false;
        }
        if (cancel && cancel == "true")
           return false;
        
        /* Sequence numbers: Server increments this each time. 
         * If we receive document out of order, return, 
         * -1 is a special case. Just return it. 
         */
        var ovrSeqNo = objDomTree.getAttribute("seq");
        if (ovrSeqNo) {
             var n = parseInt(ovrSeqNo);
             if ( n > 0 && n <= lastOvrSeq) 
                return false;
           
             this.seq = n; 
             if (n >= 0) lastOvrSeq = n;
        } 
        var ovrView = objDomTree.getAttribute("view");
        if (ovrView && ovrView != selectedFView) {
            OpenLayers.Console.info("LOAD XML: View name mismatch -> IGNORE");
            return false;
        }
        
        var metas = objDomTree.getElementsByTagName("meta");
        for (var i=0; i<metas.length; i++) {
            var m_name = metas[i].getAttribute("name");
            if (m_name) {
                var m_value = metas[i].getAttribute("value");
                if (m_value)
                   this.meta[m_name] = m_value; 
            } 
        }
        
        
        var dels = objDomTree.getElementsByTagName("delete");
        for (var i=0; i<dels.length; i++) {
                // read the id attribute
                var a_id = dels[i].getAttribute("id");
                if (!a_id) {
                        // delete all points
                        this.removePoint();
                } else {
                        this.removePoint(a_id);
                }
        }
        
        var need_update = false;
                
        var points = objDomTree.getElementsByTagName("point");
        for (var i=0; i<points.length; i++) {
                // read the mandatory attributes
                var a_pid = points[i].getAttribute("id");
                if (!a_pid) {
                        continue;
                }
                var pid = a_pid;
                                
                var np = this.getPointObject(pid);
                if (np == null) {
                        // Create a new point
                        np = new kaXmlPoint(pid,this);
                        this.ovrObjects.push(np);
                }

                np.parse(points[i]);
                need_update = true;
        }
        
        if (need_update) this.kaMap.updateObjects();
        return true;
}


 
/**
 * pid          Point ID
 * return The DIV object of the given point ID. null if not found.
 */
kaXmlOverlay.prototype.getDiv = function(pid) {
     var div_id = this.getDivId(pid);
     return getRawObject(div_id);
}


/**
 * pid          Point ID
 * return The kaXmlPoint object given the point ID. null if not found.
 */
kaXmlOverlay.prototype.getPointObject = function(pid) {
     for (var i=0; i < this.ovrObjects.length; i++) {
          if (this.ovrObjects[i] != null && this.ovrObjects[i].pid == pid) {
               return this.ovrObjects[i];
          }
     }
     return null;
}



/**
 * Instantiate a new kaXmlPoint adn add it to the overlay. If the PID
 * already exists it's deleted and recreated.
 *
 * pid          Point ID
 * x                    X Coordinate
 * y                    Y Coordinate
 * return A kaXmlPoint object with the given point ID.
 */
kaXmlOverlay.prototype.addNewPoint = function(pid,x,y) {
    this.removePoint(pid);
    var np = new kaXmlPoint(pid, this);
    np.placeOnMap(x,y);
    this.ovrObjects.push(np);
    return np;
}



/**
 * pid          Point ID
 * return the DIV id given the point ID
 */
kaXmlOverlay.prototype.getDivId = function(pid) {
        return 'xmlovr_'+pid+'_div';
}




kaXmlOverlay.prototype.removePointExcept = function( pid ) {
  
  var re = (pid==null ? null : new RegExp(pid));
  for (var i=this.ovrObjects.length; i-- > 0; ) {
     if (this.ovrObjects[i] != null) {
        if (pid==null || !re.test(this.ovrObjects[i].pid)) {
           this.ovrObjects[i].removeFromMap();
           delete this.ovrObjects[i];
           this.ovrObjects[i] = null;
        }
     } else
        this.ovrObjects.splice(i,1); 
  }       
}  
  
  
  /**
 * Remove one or more point div from the map.
 * If pid is null or not present remove all points.
 * If pid starts with ! it means match all except pid
 *
 * pid          Point ID or a regexp 
 */
kaXmlOverlay.prototype.removePoint = function( pid ) {
   
    if ( (this.removePoint.arguments.length < 1) || (pid == null) ) 
        this.removePointExcept();       
  
    else {    
        var re = new RegExp(pid);
        for (var i=this.ovrObjects.length; i-- > 0; ) {
            if (this.ovrObjects[i] != null) {
                if (re.test(this.ovrObjects[i].pid)) {
                    this.ovrObjects[i].removeFromMap();
                    delete this.ovrObjects[i];
                    this.ovrObjects[i] = null;
                    this.ovrObjects.splice(i,1);
                }
            } else 
                this.ovrObjects.splice(i,1);         
        }
    }
}


kaXmlOverlay.prototype.removePointGeo = function( x0, y0, x1, y1 ) {
        for (var i=this.ovrObjects.length; i-- > 0; ) {
            var obj = this.ovrObjects[i];
            if (obj != null) {                
                if (obj.geox < x0 || obj.geoy < y0 || obj.geox > x1 || obj.geoy > y1) {
                    obj.removeFromMap();
                    delete obj;
                    this.ovrObjects[i] = null;
                    this.ovrObjects.splice(i,1);
                } 
            } else {
                this.ovrObjects.splice(i,1);
            }
        }
    
}


/**
 * Base class for all graphics elements.
 */
function kaXmlGraphicElement() {}

/**
 * Initialize the graphics element from an XML element
 *
 * point                        The parent kaXmlPoint object
 * domElement   The XML DOM element that describe the graphic
 */
kaXmlGraphicElement.prototype.parseElement = function(point, domElement) {}



/**
 * Draw the graphics element
 *
 * point                The parent kaXmlPoint object
 */
kaXmlGraphicElement.prototype.draw = function(point) {}



/**
 * Draw the graphics element
 *
 * point                The parent kaXmlPoint object
 */
kaXmlGraphicElement.prototype.rescale = function(point) {}



/**
 * Dispose the resources allocated in the graphics element
 *
 * point                The parent kaXmlPoint object
 */
kaXmlGraphicElement.prototype.remove = function(point) {}



/**
 * Construct a symbol 
 */
function kaXmlSymbol() {
    kaXmlGraphicElement.apply(this);
    if (_BrowserIdent_hasCanvasSupport())
        kaXmlSymbol.prototype['draw'] = kaXmlSymbol.prototype['draw_canvas'];
   
    for (var p in kaXmlGraphicElement.prototype) {
        if (!kaXmlSymbol.prototype[p]) 
            kaXmlSymbol.prototype[p]= kaXmlGraphicElement.prototype[p];
    }
        
    this.shape = "bullet";
    this.size = 10;
    this.stroke = 1;
    this.color = null;
    this.bcolor = null;
    this.opacity = 1;
    
    this.canvas = null;
    this.ldiv = null;
}



kaXmlSymbol.prototype.remove = function(point) 
{
     this.canvas = null;
     this.ldiv = null;       
}



kaXmlSymbol.prototype.parseElement = function(point, domElement) 
{
     this.shape = domElement.getAttribute("shape");
     this.size = parseInt(domElement.getAttribute("size"));
     var c = domElement.getAttribute("color");
     if (c != null) this.color = c;
     var c = domElement.getAttribute("bcolor");
     if (c != null) this.bcolor = c;
     c = parseFloat(domElement.getAttribute("opacity"));
     if(! isNaN(c)) this.opacity = c; 
     c = parseInt(domElement.getAttribute("stroke"));
     if (! isNaN(c)) this.stroke = c;
}




kaXmlSymbol.prototype.draw_canvas = function(point) {
      var d = Math.floor((this.size + this.stroke) / 2);     
      
      if (this.canvas == null) {
          this.ldiv = document.createElement( 'div' );
          this.ldiv.style.position = 'absolute';
          this.ldiv.style.left = -d+'px';
          this.ldiv.style.top = -d+'px';
          point.div.appendChild(this.ldiv);
          this.canvas = _BrowserIdent_newCanvas(this.ldiv);
          _BrowserIdent_setCanvasHW(this.canvas,d*2,d*2);
      } 
      
      var ctx = _BrowserIdent_getCanvasContext(this.canvas);
      ctx.save();
     
      ctx.translate(d,d);
      ctx.globalAlpha = this.opacity;
      ctx.lineWidth = this.stroke;
      if (this.bcolor) ctx.strokeStyle = this.bcolor; 
      if (this.color) ctx.fillStyle = this.color;
      
      if (this.shape == 'square') {
           if (this.color) ctx.fillRect(-this.size/2.0,-this.size/2.0,this.size,this.size);
           if (this.bcolor) ctx.strokeRect(-this.size/2.0,-this.size/2.0,this.size,this.size);
      } else {
           ctx.beginPath();
           ctx.arc(0,0,this.size/2.0,0,Math.PI*2,false);
           if (this.color) ctx.fill();     
           if (this.bcolor) ctx.stroke();  
      }
      ctx.restore();
}



/****************************************************
 * kaXmlFeature
 * Construct a geographic feature
 ****************************************************/
 
function kaXmlFeature( point ) {
    kaXmlGraphicElement.apply(this);
    for (var p in kaXmlGraphicElement.prototype) {
        if (!kaXmlFeature.prototype[p]) 
            kaXmlFeature.prototype[p]= kaXmlGraphicElement.prototype[p];
    }
    
    this.stroke = 1;
    this.color = null;
    this.color2 = null;    
    this.bcolor = null;
    this.opacity = 1;

    this.cxmin = 0;
    this.cymax = 0;
    this.cymin = 0;
    this.cxmax = 0;
    this.coords = "";
    this.img = null;
    this.canvas = null;
    this.ldiv = null;       
    this.xn = null;
    this.yn = null;
    
    // Calculate the min cellSize
    // It seems like it does not matter much what maxScale is set to...
    this.maxScale = point.xml_overlay.kaMap.getMaxScale();
    this.mcs = point.xml_overlay.kaMap.getResolution() / (point.xml_overlay.kaMap.getCurrentScale() / this.maxScale);
}


kaXmlFeature.prototype.remove = function(point) {
      this.img = null;
      this.canvas = null;
      this.ldiv = null;
      this.coords = null;     
      this.xn.splice(0);
      this.yn.splice(0);
}

        
kaXmlFeature.prototype.parseElement = function(point, domElement) {
      var t;
      t = parseInt(domElement.getAttribute("stroke"));
      if (! isNaN(t)) this.stroke = t;
      t = domElement.getAttribute("color");
      if (t != null) this.color = t;
      t = domElement.getAttribute("color2");
      if (t != null) this.color2 = t;      
      t = domElement.getAttribute("bcolor");
      if (t != null) this.bcolor = t;
      t = parseFloat(domElement.getAttribute("opacity"));
      if(! isNaN(t)) this.opacity = t; 
      
      var text = "";
      if (domElement.firstChild != null) {
            text = domElement.firstChild.data;
            this.readCoordinates(point, text);      
      }
}



/**
 * Read the feature coordinates from a string 
 *
 *   x0 y0, x1 y1, [...], xn yn
 */
kaXmlFeature.prototype.readCoordinates = function(point, text) {
     var cx = new Array();
     var cy = new Array();
     this.tn = new Array();
     
     var pp = text.split(',');
     var i;
     for (i=0; i<pp.length; i++) {
          var s = pp[i];
          var xy = s.match(/[-\+\d\.]+/g);
          if (xy != null) {
               var x=parseFloat(xy[0]);
               var y=parseFloat(xy[1]);
               
               cx.push(x);
               cy.push(y);
               this.tn.push(xy[2]);
          }
     }
     this.setCoordinates(point,cx,cy);
}



/**
 * Set the coordinates of the feature.
 * 
 * xArray       Ordered array of x coordinates (float)
 * yArray       Ordered array of y coordinates (float)
 */
kaXmlFeature.prototype.setCoordinates = function(point, xArray, yArray) 
{
     this.cxmin = 0;
     this.cymax = 0;
     this.cymin = 0;
     this.cxmax = 0;
     this.coords = "";
     var i;
     for (i=0; i<xArray.length; i++) {
         var x=xArray[i];
         var y=yArray[i];
         if (i==0 || x<this.cxmin) this.cxmin = x;
         if (i==0 || y>this.cymax) this.cymax = y;
         if (i==0 || y<this.cymin) this.cymin = y;
         if (i==0 || x>this.cxmax) this.cxmax = x;
     }
     
     this.xn = new Array();
     this.yn = new Array();
     
     // Normalize the coordinates
     for (i=0; i<xArray.length; i++) {
         
         var x = (xArray[i] - this.cxmin) / this.mcs;
         var y = (this.cymax - yArray[i]) / this.mcs;
         if (i>0) this.coords += ",";
                 this.coords += Math.round(x)+","+Math.round(y);
         this.xn.push(x);
         this.yn.push(y);
     }
}



kaXmlFeature.prototype.rescale = function(point) {
 //   this.draw(point);
}




/***************************************************************
 * kaXmlLinestring
 * Construct a linestring 
 ***************************************************************/
 
function kaXmlLinestring( point ) 
{
    kaXmlFeature.apply(this, [point]);

    if ( _BrowserIdent_hasCanvasSupport())
        kaXmlLinestring.prototype['draw'] = kaXmlLinestring.prototype['draw_canvas'];
    else
        kaXmlLinestring.prototype['draw'] = function() {};   
      
    for (var p in kaXmlFeature.prototype) {
        if (!kaXmlLinestring.prototype[p]) 
            kaXmlLinestring.prototype[p]= kaXmlFeature.prototype[p];
    }
}




kaXmlLinestring.prototype.draw_canvas = function(point) 
{       if (point == null || this.xn == null) {
           OpenLayers.Console.warn("kaXmlLinestring: point/coordinate is null", point, this);
           return;
        }

        var xy = point.xml_overlay.kaMap.geoToPix( this.cxmin, this.cymax );
        var x0 = xy[0];
        var y0 = xy[1];
        
        xy = point.xml_overlay.kaMap.geoToPix( this.cxmax, this.cymin );
        var x1 = xy[0];
        var y1 = xy[1];
        
        xy = point.xml_overlay.kaMap.geoToPix( point.div.lon, point.div.lat );
        var xr = xy[0];
        var yr = xy[1];
        
        var border = 5;
        var scf = point.xml_overlay.kaMap.getCurrentScale() / this.maxScale;

        var sizex = (x1 - x0) + (border*2);
        var sizey = (y1 - y0) + (border*2);
        
        /* Skip if trail is too small to be visible? */
        if (sizex <= border*2+15 && sizey <= border*2+15)
           return;
        
        if (this.canvas == null) {
            this.ldiv = document.createElement( 'div' );
            this.ldiv.setAttribute('id', point.pid+"_trace");
            this.ldiv.style.position = 'absolute';
	    
	    if ( _sstorage['polaric.hidetrace.'+point.pid] == 'T' || _sstorage['polaric.hidetrace.ALL'] == 'T')
               this.ldiv.style.visibility = 'hidden';
            point.div.appendChild(this.ldiv);
            this.canvas = _BrowserIdent_newCanvas(this.ldiv);
        } 
        
        this.ldiv.style.left = (x0 - xr - border)+'px';
        this.ldiv.style.top = (y0 - yr - border)+'px';
        _BrowserIdent_setCanvasHW(this.canvas, sizey, sizex);
        
        var ctx = _BrowserIdent_getCanvasContext(this.canvas);
        ctx.save();
        ctx.clearRect(0, 0, sizex, sizey);
        ctx.translate(border,border);
        ctx.strokeStyle = '#' + this.color;
        ctx.globalAlpha = this.opacity;
        ctx.lineWidth = this.stroke;
        ctx.beginPath();  
        ctx.moveTo(this.xn[0]/scf, this.yn[0]/scf);
        
        var i;
        for (i=1; i<this.xn.length; i++) 
             ctx.lineTo(this.xn[i]/scf, this.yn[i]/scf);
        ctx.stroke();
        ctx.strokeStyle = '#' + this.color2;
        ctx.beginPath();

        for (i=1; i<this.xn.length; i++) {
           ctx.moveTo(this.xn[i]/scf, this.yn[i]/scf);
           ctx.arc(this.xn[i]/scf, this.yn[i]/scf, 1, 0, Math.PI*2, false);
           
           var pt = document.createElement('div');
           pt._time = this.tn[i];
           pt.style.position = 'absolute';
           pt.title = point.pid+" "+showTime(this.tn[i]);
           pt.className = 'trailPoint';
           this.ldiv.appendChild(pt);
           pt.style.left = (this.xn[i]/scf-4) +'px';
           pt.style.top = (this.yn[i]/scf-4)+'px';
           pt.style.width = pt.style.height = '14px';
           pt.style.zIndex = '1190';
           pt._index = i;
           pt._time = this.tn[i];
           pt.setAttribute('id', point.pid+"_"+i+"_trail");
           pt.onclick = function (e) 
             { return myTrailClicked(point.pid, e); }
        }
        ctx.stroke();
        ctx.restore();

        function showTime(t)
           { return t.substring(8,10)+":"+t.substring(10,12); }    
}



kaXmlLinestring.prototype.rescale = function(point) {
      this.draw(point);
}




/*****************************************************************************
 * kaXmlPolygon
 * Construct a Polygon from the XML element
 *****************************************************************************/
 
function kaXmlPolygon( point ) 
{
    kaXmlFeature.apply(this, [point]);
    
    if (_BrowserIdent_hasCanvasSupport())
        kaXmlPolygon.prototype['draw'] = kaXmlPolygon.prototype['draw_canvas'];
    else
        kaXmlPolygon.prototype['draw'] = function() {};
    
    for (var p in kaXmlFeature.prototype) {
        if (!kaXmlPolygon.prototype[p]) 
            kaXmlPolygon.prototype[p]= kaXmlFeature.prototype[p];
    }
}



kaXmlPolygon.prototype.draw_canvas = function(point) 
{
    var xy = point.xml_overlay.kaMap.geoToPix( this.cxmin, this.cymax );
    var x0 = xy[0];
    var y0 = xy[1];
    
    xy = point.xml_overlay.kaMap.geoToPix( this.cxmax, this.cymin );
    var x1 = xy[0];
    var y1 = xy[1];
    
    xy = point.xml_overlay.kaMap.geoToPix( point.div.lon, point.div.lat );
    var xr = xy[0];
    var yr = xy[1];
    
    var border = 5;
    var scf = point.xml_overlay.kaMap.getCurrentScale() / this.maxScale;
    
    var sizex = (x1 - x0) + (border*2);
    var sizey = (y1 - y0) + (border*2);
    
    if (this.canvas == null) {
        this.ldiv = document.createElement( 'div' );
        this.ldiv.style.position = 'absolute';
        point.div.appendChild(this.ldiv);
        this.canvas = _BrowserIdent_newCanvas(this.ldiv);
    } 
    
    this.ldiv.style.left  = (x0 - xr - border)+'px';
    this.ldiv.style.top = (y0 - yr - border)+'px';
    _BrowserIdent_setCanvasHW(this.canvas,sizey,sizex);
    
    var ctx = _BrowserIdent_getCanvasContext(this.canvas);
    ctx.save();
    ctx.clearRect(0, 0, sizex, sizey);
    ctx.translate(border,border);
    if (this.color != null) ctx.fillStyle = this.color;
    if (this.bcolor != null && this.bcolor != "") ctx.strokeStyle = this.bcolor;
    ctx.globalAlpha = this.opacity;
    ctx.lineWidth = this.stroke;
    ctx.beginPath();
    ctx.moveTo(this.xn[0]/scf, this.yn[0]/scf);
    
    var i;
    for (i=1; i<this.xn.length; i++) {
        ctx.lineTo(this.xn[i]/scf, this.yn[i]/scf);
    }
    
    if (this.color != null) ctx.fill();
    if (this.bcolor != null && this.bcolor != "") ctx.stroke();
    ctx.restore();
}



/**********************************************************************
 * kaXmlLabel
 * Construct a label from the XML element
 **********************************************************************/
 
function kaXmlLabel() 
{
    kaXmlGraphicElement.apply(this);
    for (var p in kaXmlGraphicElement.prototype) {
        if (!kaXmlLabel.prototype[p]) 
            kaXmlLabel.prototype[p]= kaXmlGraphicElement.prototype[p];
    }
        
    this.text = "";
    this.color = "black";
    this.boxcolor = null;
    this.w = 64;
    this.h = 24;
    this.xoff = 0;
    this.yoff = 0;
    this.fsize = "10px";
    this.font = "Arial";
    this.ldiv = null;
    this.ltxt = null;
    this.flash = false;
    this.classn = null;
}


kaXmlLabel.prototype.remove = function(point) {
    this.canvas = null;
    this.ldiv = null;       
    this.ltxt = null;
}


kaXmlLabel.prototype.parseElement = function(point, domElement) 
{
    if (domElement.firstChild != null) {
        this.text = domElement.firstChild.data;
    }

    var t;          
    t = domElement.getAttribute("color");
    if (t != null) {
        this.color = t;
    }
    this.boxcolor = domElement.getAttribute("boxcolor");
    t = parseInt(domElement.getAttribute("w"));
    if (!isNaN(t)) {
        this.w = t;
    }
    t = parseInt(domElement.getAttribute("h"));
    if (!isNaN(t)) {
        this.h = t;
    }
    t = parseInt(domElement.getAttribute("px"));
    if (!isNaN(t)) {
        this.xoff = t;
    }
    t = parseInt(domElement.getAttribute("py"));
    if (!isNaN(t)) {
        this.yoff = t;
    }
    t = domElement.getAttribute("fsize");
    if (t != null) {
        this.fsize = t;
    }
    t = domElement.getAttribute("font");
    if (t != null) {
        this.font = t;
    }    
    t = domElement.getAttribute("flash");
    if (t != null) {
        this.flash = t;
    }    
    t = domElement.getAttribute("style");
    if (t != null) {
        this.classn = t;
    }
}


kaXmlLabel.prototype.draw = function(point) {
    var x = this.xoff;
    var y = this.yoff;
    
    this.ldiv = document.createElement( 'div' );
    if (this.classn != null)
       this.ldiv.className = this.classn;
    else 
    {
       this.ldiv.style.fontFamily = this.font;
       this.ldiv.style.fontWeight = 'bold';                
       this.ldiv.style.fontSize = this.fsize;
       this.ldiv.style.textAlign = 'center';
       this.ldiv.style.color = this.color;
       this.ldiv.style.left = x+'px';
       this.ldiv.style.top = y+'px';
       this.ldiv.style.paddingTop = '1px';             
       this.ldiv.style.paddingBottom = '1px';          
       this.ldiv.style.border = 'outset 1px';          
       this.ldiv.style.position = 'absolute';
       this.ldiv.style.lineHeight = '1.1em';
       if (this.flash) {
           this.ldiv.style.textDecoration = 'blink';
           this.ldiv.style.border = 'solid 3px red';
       }
       if (this.boxcolor != null) this.ldiv.style.backgroundColor = this.boxcolor;
    
       this.ldiv.style.whiteSpace = 'nowrap';
    }
  
    this.ldiv.style.width = 'auto';               
    this.ldiv.style.height = 'auto';              
    
    this.ltxt = document.createTextNode(this.text);
    this.ldiv.appendChild( this.ltxt );
}


kaXmlLabel.prototype.rescale = function(point) {
}



/******************************************************************
 * kaXmlIcon
 * Construct an icon
 ******************************************************************/
 
function kaXmlIcon() {
    kaXmlGraphicElement.apply(this);
    kaXmlIcon.prototype['draw'] = kaXmlIcon.prototype['draw_plain'];
    for (var p in kaXmlGraphicElement.prototype) {
        if (!kaXmlIcon.prototype[p]) 
            kaXmlIcon.prototype[p]= kaXmlGraphicElement.prototype[p];
    }
    
        this.icon_src = null;
        this.icon_w = 0;
        this.icon_h = 0;
        this.xoff = 0;
        this.yoff = 0;
        this.rot = 0;
        this.ldiv = null;       
        this.img = null;        
}

kaXmlIcon.prototype.setImage = function(point, src, w, h) {
   this.icon_src = src;
   this.icon_w = w;
   this.icon_h = h;
}


kaXmlIcon.prototype.remove = function(point) {
        this.ldiv = null;       
        if (this.img) this.img.onload = null;
        this.img = null;        
}



kaXmlIcon.prototype.parseElement = function(point, domElement) {
        this.setImage(point, domElement.getAttribute("src"), domElement.getAttribute("w"), domElement.getAttribute("h"));
        var t;
        t = parseInt(domElement.getAttribute("px"));
        if (!isNaN(t)) {
                this.xoff = t;
        }
        t = parseInt(domElement.getAttribute("py"));
        if (!isNaN(t)) {
                this.yoff = t;
        }
        t = parseInt(domElement.getAttribute("rot"));
        if (!isNaN(t)) {
                this.rot = t;
        }
}



kaXmlIcon.prototype.draw_plain = function(point) {
        var dx = -this.icon_w / 2 + this.xoff;     
        var dy = -this.icon_h / 2 + this.yoff;     
        
    this.ldiv = document.createElement( 'div' );
    this.ldiv.style.position = 'absolute';
    this.ldiv.style.top = dy+'px';
    this.ldiv.style.left = dx+'px';
    
    this.img = document.createElement( 'img' );
    this.img.src = this.icon_src;
    //img.class = 'png24';
    this.img.width = this.icon_w;
    this.img.height = this.icon_h;
    this.ldiv.appendChild( this.img );
}





/*************************************************************************
 * kaXmlPoint
 *
 * This object is a single point on the overlay.
 * The object hold the div and all the stuff to draw and move the point 
 * (symbol, label, icon, etc.).
 *
 * pid                  The point ID (string)
 * xml_overlay  The kaXmlOverlay object owner of this point
 *************************************************************************/
 
function kaXmlPoint(pid, xml_overlay) {
        this.xml_overlay = xml_overlay;
        this.pid = pid;
        this.divId = this.xml_overlay.getDivId(pid);
        this.geox = 0;
        this.geoy = 0;
        this.shown = false;
        this.hasTrace = false;
        this.own = false;
        this.thandler = new touchHandler();
        
        this.graphics = new Array();
        
        this.div = document.createElement('div');
        this.div.setAttribute('id', this.divId);
}



/**
 * Show the point in the specified geo-position.
 */
kaXmlPoint.prototype.placeOnMap = function( x, y ) {
     if (!this.shown) {
         this.geox = x;
         this.geoy = y;
         this.showOnMap();
     }
}
kaXmlPoint.prototype.showOnMap = function( ) {
     if (!this.shown) {
         this.xml_overlay.kaMap.addObjectGeo( this.xml_overlay.overlayCanvas, this.geox, this.geoy, this.div );
         this.shown = true;
     }
}


/**
 * Delete the point.
 */
kaXmlPoint.prototype.removeFromMap = function( ) {
        if (this.shown) {
                this.xml_overlay.kaMap.removeObject( this.div );
                this.shown = false;
        }
        
        var i;
        for (i=0; i<this.graphics.length; i++) {
                this.graphics[i].remove(this);
        }
        
        this.graphics.splice(0);
        this.div = null;
        this.xml_overlay = null;
}


/**
 * Move the point in the specified geo-position.
 */
kaXmlPoint.prototype.setPosition = function( x, y ) {
        if (this.shown) {
                this.geox = x;
                this.geoy = y;
                this.div.lat = y;
                this.div.lon = x;
        }
}


/**
 * Add a new kaXmlGraphicElement to this kaXmlPoint.
 * kaXmlGraphicElement subclasses are:
 *  
 *  kaXmlSymbol
 *  kaXmlIcon
 *  kaXmlLabel
 *  kaXmlLinestring
 *  kaXmlPolygon
 *
 * obj  an object of class kaXmlGraphicElement
 */
kaXmlPoint.prototype.addGraphic = function( obj ) {
                this.graphics.push(obj);
                obj.draw(this);
}


/**
 * Clear all the graphic elements of this kaXmlPoint.
 */
kaXmlPoint.prototype.clear = function() {
        this.div.innerHTML = "";
        this.graphics.length = 0;
        //this.graphics = new Array();
}


/**
 * Set the HTML content of this kaXmlPoint.
 * This function delete any other content of the point.
 *
 * ihtml                A string containing the HTML
 */
kaXmlPoint.prototype.setInnerHtml = function(ihtml) {
        this.clear();
        this.div.innerHTML = ihtml;
}


kaXmlPoint.prototype.moveToFront = function(point_element) {
    this.div.style.zIndex = zzindex + 20;
}




/**
 * Parse the XML fragment describing the point. Then draw or translate
 * the point on the map.
 *
 * point_element         A DOM element <point>
 */
var tstate = null;
kaXmlPoint.prototype.parse = function(point_element) {
        var zi; // Added by LA7ECA.
        var i;
        var px = this.geox;
        var py = this.geoy;
        var x = parseFloat(point_element.getAttribute("x"));
        var y = parseFloat(point_element.getAttribute("y"));
	var href = point_element.getAttribute("href");
        var title = point_element.getAttribute("title");    
        var ident = point_element.getAttribute("id");    
        var isSign = (ident.substr(0,2) == "__");
        var redraw_a = point_element.getAttribute("redraw");
        var redraw = false;
        var tracked = false;
        if (redraw_a == "true") redraw = true;
        var own_a = point_element.getAttribute("own");
        if (own_a == "true") this.own = true;
        
        tracked = (_sstorage['polaric.tracked'] != null && ident == _sstorage['polaric.tracked']);                         
        
        if (!this.shown) {
                this.placeOnMap(x,y);
                this.shown = true;
                redraw = true;
        } else {
                if (redraw) 
                    this.clear(); 
                
                this.setPosition(x,y);
                /* Tracking of object: Move object to center of display */
                if (tracked) {
                    myZoomToGeo(x, y, 0.1);  
                    return;
                }        
        }          
        // Need redraw?
        if (redraw) {           
        
           /*
            * Added by LA7ECA. Add a div which enclose labels and icons
            * to allow those to react to mouse or touch events.
            */             
           var mdiv = document.createElement( 'div' );
           mdiv.setAttribute('id', ident+"_label");
           this.div.appendChild(mdiv);
           mdiv.style.position = 'absolute'; 
           mdiv.className = "point"; 
           mdiv.style.zIndex = zzindex+10;
           if (isSign)
              mdiv.style.zIndex = zzindex - 10;  
           else
           {
              //  Special treatment for IE.  Arrrrgh! 
              if ( _BrowserIdent_isMSIE()) {
                 mdiv.onmouseover = function ()
                    { this.parentNode.style.zIndex = zzindex + 100; }
                 mdiv.onmouseout= function ()     
                    { this.parentNode.style.zIndex = zzindex; }
              }
              else {
                 mdiv.onmouseover = function ()
                    { this.style.zIndex = zzindex + 100; }
                 mdiv.onmouseout= function ()     
                    { this.style.zIndex = zzindex; }
              }
           }
           // LA7ECA: I added this for popup menu. Need this anymore? 

           if (title != null)
              mdiv.title = title; 
 
             mdiv.onclick= function (e) 
             { return myObjectClicked(ident, e, href, title); }
          
           if (!isSign) {    
                       
             mdiv.oncontextmenu= function(e)
             { ctxtMenu.show(ident, e); return false; }
             
             mdiv.ontouchstart = this.thandler.handle;         
             mdiv.ontouchend = this.thandler.handle;
           }
        
              
           // look for ihtml element
           var ihtml_element = point_element.getElementsByTagName("ihtml");
           for (i=0; i<ihtml_element.length; i++) 
                this.div.innerHTML = ihtml_element[i].firstChild.nodeValue;
           
        
           var t;
           var elements;
        
           // look for linestring element
           this.hasTrace = false;
           elements = point_element.getElementsByTagName("linestring");
           for (i=0; i<elements.length; i++) {
                t = new kaXmlLinestring(this);
                t.parseElement(this, elements[i]);
                this.addGraphic(t);
                this.hasTrace = true;
           }
        
           // look for icon element
           elements = point_element.getElementsByTagName("icon");
           for (i=0; i<elements.length; i++) {
                t = new kaXmlIcon();
                t.parseElement(this, elements[i]);
                this.addGraphic(t);
                mdiv.appendChild(t.ldiv);  
           }
        
           // look for polygon element
           elements = point_element.getElementsByTagName("polygon");
           for (i=0; i<elements.length; i++) {
                t = new kaXmlPolygon(this);
                t.parseElement(this, elements[i]);
                this.addGraphic(t);
           }

           // look for label element
           elements = point_element.getElementsByTagName("label");
           for (i=0; i<elements.length; i++) {
                t = new kaXmlLabel();
                t.parseElement(this, elements[i]);
                this.addGraphic(t);
                mdiv.appendChild(t.ldiv);  
                t.ldiv.setAttribute('id', ident+"_label_txt");
                t.ldiv.style.fontSize = labelStyle.getFontSize(); 
                if (labelIsHidden(ident))
                    t.ldiv.style.visibility = 'hidden';
           }
       }
       if (tracked)  
          setTracking(ident);  
}



kaXmlPoint.prototype.rescale = function(point_element) {
        var i;
        this.placeOnMap(this.geox, this.geoy);
        for (i=0; i<this.graphics.length; i++) {
            this.graphics[i].rescale(this);
        }
}


/**************************************************************/


var _BrowserIdent_browser = null;
var _BrowserIdent_version = null;
var _BrowserIdent_place = 0;
var _BrowserIdent_thestring = null;
var _BrowserIdent_detect = null;
var _BrowserIdent_isIE = false; 


function _BrowserIdent() {
        _BrowserIdent_detect = navigator.userAgent.toLowerCase();

        if (_BrowserIdent_checkIt('konqueror')) {
                _BrowserIdent_browser = "Konqueror";
        } else if (_BrowserIdent_checkIt('safari')) _BrowserIdent_browser = "Safari";
        else if (_BrowserIdent_checkIt('omniweb')) _BrowserIdent_browser = "OmniWeb";
        else if (_BrowserIdent_checkIt('opera')) _BrowserIdent_browser = "Opera"
        else if (_BrowserIdent_checkIt('webtv')) _BrowserIdent_browser = "WebTV";
        else if (_BrowserIdent_checkIt('icab')) _BrowserIdent_browser = "iCab";
        else if (_BrowserIdent_checkIt('msie')) _BrowserIdent_browser = "Internet Explorer";
        else if (_BrowserIdent_checkIt('firefox')) _BrowserIdent_browser = "Firefox";
        else if (_BrowserIdent_checkIt('iceweasel')) _BrowserIdent_browser = "Firefox";
        else if (!_BrowserIdent_checkIt('compatible')) {
                _BrowserIdent_browser = "Netscape Navigator"
                _BrowserIdent_version = _BrowserIdent_detect.charAt(8);
        } else _BrowserIdent_browser = "An unknown browser";

        if (!_BrowserIdent_version) 
           _BrowserIdent_version = _BrowserIdent_detect.charAt(_BrowserIdent_place + _BrowserIdent_thestring.length);
        
        if (_BrowserIdent_isMSIE() && safeParseInt(_BrowserIdent_version) <= 7)
           alert("OBS: Vi støtter ikke lenger Internet Explorer versjon 7 eller eldre. Anbefaler oppgradering av nettleser"); 
}

function _BrowserIdent_isMSIE()
{ return _BrowserIdent_browser == "Internet Explorer"; }


function _BrowserIdent_isOpera()
{ return _BrowserIdent_browser == "Opera"; }


function _BrowserIdent_checkIt(string) {
        _BrowserIdent_place = _BrowserIdent_detect.indexOf(string) + 1;
        _BrowserIdent_thestring = string;
        return _BrowserIdent_place;
}

function _BrowserIdent_setOpacity(imageobject, opacity) {
        if (opacity == undefined || opacity >= 1) return '';
        if (_BrowserIdent_browser == "Netscape Navigator")
                imageobject.style.MozOpacity=opacity;
        else if (_BrowserIdent_browser == "Internet Explorer" && parseInt(this.version)>=4) {
                //filter: alpha(opacity=50);
                var tmp = imageobject.style.cssText;
                tmp = "filter: alpha(opacity="+(opacity*100)+");" + tmp;
                imageobject.style.cssText = tmp;
        } else {
                var tmp = imageobject.style.cssText;
                tmp = "opacity: "+opacity+";" + tmp;    
                imageobject.style.cssText = tmp;
        }
}

function _BrowserIdent_getPreferredImageType() {
        if (_BrowserIdent_browser == "Netscape Navigator") return "P";
        else if (_BrowserIdent_browser == "Opera") return "P";
        else if (_BrowserIdent_browser == "Firefox") return "P";
        else if (_BrowserIdent_browser == "Safari") return "P";
        else if (_BrowserIdent_browser == "Konqueror") return "P";
        else return "G"
}

function _BrowserIdent_getPreferredOpacity() {
        if (_BrowserIdent_browser == "Netscape Navigator") return "server";
        else if (_BrowserIdent_browser == "Firefox") return "server";
        else if (_BrowserIdent_browser == "Opera") return "server";
        else if (_BrowserIdent_browser == "Konqueror") return "server";
        else return "client"
}

var xmlOverlayUseCanvas = true;

function _BrowserIdent_hasCanvasSupport() {

        if (! xmlOverlayUseCanvas) return false;
        
        if (_BrowserIdent_browser == "Internet Explorer") return true; 
        if (_BrowserIdent_browser == "Firefox") return true;
        if (_BrowserIdent_browser == "Safari") return true;
        //if (_BrowserIdent_browser == "Konqueror") return true;
        if (_BrowserIdent_browser == "Opera") return true;
        
        return false;
}

function _BrowserIdent_newCanvas(parentNode) {
        var el = document.createElement('canvas');
        parentNode.appendChild(el);
        if (typeof G_vmlCanvasManager != "undefined") {
                el = G_vmlCanvasManager.initElement(el);
        }
        return el;
}


function _BrowserIdent_getCanvasContext(canvas) {
      if (_BrowserIdent_hasCanvasSupport())
          return canvas.getContext('2d');
      else
          return null;
}

function _BrowserIdent_setCanvasHW(canvas, height, width) {
                canvas.width = width; 
                canvas.height = height;
}

_BrowserIdent();
