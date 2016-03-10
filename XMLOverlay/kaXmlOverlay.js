/******************************************************************************
 * kaXmlOverlay - XML server side generated overlay for kaMap.
 *
 * Based on code by
 *   Piergiorgio Navone 
 * Modifications/additions/removals by 
 *   Øyvind Hanssen, LA7ECA
 *
 *****************************************************************************/

/**
 * kaMap! events
 */
var ovrLastEventId = 0;
var XMLOVERLAY_LOAD = ovrLastEventId ++;
var XMLOVERLAY_ERROR = ovrLastEventId ++;



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

   if (ident == 'ALL') {
      for (var i=0; i < this.ovrObjects.length; i++) 
        if (this.ovrObjects[i] != null)
          _setElemTrace(this.ovrObjects[i].pid, hide);     
   }
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


  
  
kaXmlOverlay.prototype.registerForEvent = function( eventID, obj, func ) {
    return this.eventManager.registerForEvent(eventID, obj, func);
};


kaXmlOverlay.prototype.deregisterForEvent = function( eventID, obj, func ) {
    return this.eventManager.deregisterForEvent(eventID, obj, func);
};


kaXmlOverlay.prototype.triggerEvent = function( eventID /*pass additional arguments*/ ) {
    return this.eventManager.triggerEvent.apply( this.eventManager, arguments );
};





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
    
    //event manager
    this.eventManager = new _eventManager();   
    /* register the known events */
    for (var i=0; i<gnLastEventId; i++) {
      this.eventManager.registerEventID( i );
    }
    
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



kaXmlOverlay.prototype.loadXml = function(xml_url) {
    return call(xml_url, this, _loadXmlCallback, true); 
       
    function _loadXmlCallback(xml_string) {
        this.applyXml(xml_string);
    }
}



kaXmlOverlay.prototype.applyXml = function(xml_string) {
    if (xml_string == null)
       this.triggerEvent(XMLOVERLAY_ERROR);
    else if (this.loadXmlDoc(xml_string))
       this.triggerEvent(XMLOVERLAY_LOAD); 
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
        if (ovrView && ovrView != filterProfiles.selectedProf()) {
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





/**************************************************************/
/* FIXME: Most of this can go away */

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
        else if (_BrowserIdent_checkIt('msie')) _BrowserIdent_browser = "Internet Explorer";
        else if (_BrowserIdent_checkIt('firefox')) _BrowserIdent_browser = "Firefox";
        else if (_BrowserIdent_checkIt('iceweasel')) _BrowserIdent_browser = "Firefox";
        else if (_BrowserIdent_checkIt('trident')) _BrowserIdent_browser = "Newer IE";
        else if (!_BrowserIdent_checkIt('compatible')) {
                _BrowserIdent_browser = "Netscape Navigator"
                _BrowserIdent_version = _BrowserIdent_detect.charAt(8);
        } else _BrowserIdent_browser = "An unknown browser";

        if (!_BrowserIdent_version) 
           _BrowserIdent_version = _BrowserIdent_detect.charAt(_BrowserIdent_place + _BrowserIdent_thestring.length);
        
        if (_BrowserIdent_isMSIE() && 
             safeParseInt(_BrowserIdent_version) <= 8 && safeParseInt(_BrowserIdent_version) != 1)
           alert(_("Sorry: We do not support IE version 8 or older. Recommend upgrade of browser.")); 
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
        if (_BrowserIdent_browser == "Internet Explorer") return "G";
        else return "P"
}

function _BrowserIdent_getPreferredOpacity() {
         return "client"
}

var xmlOverlayUseCanvas = true;


function _BrowserIdent_hasCanvasSupport() {

        if (! xmlOverlayUseCanvas) return false;
        return true;
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
