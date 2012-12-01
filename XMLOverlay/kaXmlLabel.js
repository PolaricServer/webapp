 /******************************************************************************
  * kaXmlOverlay - XML server side generated overlay for kaMap.
  *
  * Based on code by
  *   Piergiorgio Navone 
  * Modifications/additions/removals by 
  *   Øyvind Hanssen, LA7ECA
  *
  *****************************************************************************/
 
 
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
 
 