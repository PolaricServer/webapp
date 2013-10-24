 /******************************************************************************
  * kaXmlOverlay - XML server side generated overlay for kaMap.
  *
  * Based on code by
  *   Piergiorgio Navone 
  * Modifications/additions/removals by 
  *   Øyvind Hanssen, LA7ECA
  *
  *****************************************************************************/

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
 
 kaXmlIcon.prototype.setClass = function(classname) {
   this.ldiv.className = classname; 
 }
 
 
 kaXmlIcon.prototype.draw_plain = function(point) {
   var dx = -this.icon_w / 2 + this.xoff;     
   var dy = -this.icon_h / 2 + this.yoff;     
   
   this.ldiv = document.createElement( 'div' );
   this.ldiv.style.position = 'absolute';
   this.ldiv.style.top = dy+'px';
   this.ldiv.style.left = dx+'px';
   this.ldiv.className = 'icon'; 
   
   this.img = document.createElement( 'img' );
   this.img.src = this.icon_src;
   //img.class = 'png24';
   this.img.width = this.icon_w;
   this.img.height = this.icon_h;
   this.ldiv.appendChild( this.img );
 }
 