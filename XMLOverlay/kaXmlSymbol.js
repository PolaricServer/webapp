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
   if (c != null) 
       this.color = c;
   var c = domElement.getAttribute("bcolor");
   if (c != null) 
       this.bcolor = c;
   c = parseFloat(domElement.getAttribute("opacity"));
   if(! isNaN(c)) 
       this.opacity = c; 
   c = parseInt(domElement.getAttribute("stroke"));
   if (! isNaN(c)) 
       this.stroke = c;
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
 
 