 /******************************************************************************
  * kaXmlOverlay - XML server side generated overlay for kaMap.
  *
  * Based on code by
  *   Piergiorgio Navone 
  * Modifications/additions/removals by 
  *   Øyvind Hanssen, LA7ECA
  *
  *****************************************************************************/
 
 
 
 
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
   this.flags = "";
   
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
   this.flags = point_element.getAttribute("flags");
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
     
     
     // look for pointcloud element
     elements = point_element.getElementsByTagName("pointcloud");
     for (i=0; i<elements.length; i++) {
       t = new kaXmlPointCloud(this);
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
 