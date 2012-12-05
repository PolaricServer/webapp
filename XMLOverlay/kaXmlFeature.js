 /******************************************************************************
  * kaXmlOverlay - XML server side generated overlay for kaMap.
  *
  * Based on code by
  *   Piergiorgio Navone 
  * Modifications/additions/removals by 
  *   Øyvind Hanssen, LA7ECA
  *
  *****************************************************************************/
 
 
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
   if(! isNaN(t)) 
        this.opacity = t; 
                                        
   var text = "";
   if (domElement.firstChild != null) {
      text = domElement.firstChild.data;
      this.readCoordinates(point, text);      
   }
 }
 
 
 
 /**
  * Read the feature coordinates from a string
  * t is an extra dimension, typically the time. 
  *
  *   x0 y0 t0, x1 y1 t0, [...], xn yn tn
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
   this.setCoordinates(point, cx, cy);
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
          this.coords += Math.round(x) + "," + Math.round(y);
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
 {       
    if (point == null || this.xn == null) {
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
       { return (t ? t.substring(8,10)+":"+t.substring(10,12) : ""); }    
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
   
    this.ldiv.style.left  = (x0 - xr - border) + 'px';
    this.ldiv.style.top = (y0 - yr - border) + 'px';
    _BrowserIdent_setCanvasHW(this.canvas,sizey,sizex);
   
    var ctx = _BrowserIdent_getCanvasContext(this.canvas);
    ctx.save();
    ctx.clearRect(0, 0, sizex, sizey);
    ctx.translate(border,border);
    if (this.color != null) 
        ctx.fillStyle = this.color;
    if (this.bcolor != null && this.bcolor != "") 
        ctx.strokeStyle = this.bcolor;
    ctx.globalAlpha = this.opacity;
    ctx.lineWidth = this.stroke;
    ctx.beginPath();
    ctx.moveTo(this.xn[0]/scf, this.yn[0]/scf);
   
    var i;
    for (i=1; i<this.xn.length; i++) {
       ctx.lineTo(this.xn[i]/scf, this.yn[i]/scf);
    }
   
    if (this.color != null) 
       ctx.fill();
    if (this.bcolor != null && this.bcolor != "") 
       ctx.stroke();
    ctx.restore();
 }
 
 
 
 /***************************************************************
  * kaXmlPointCloud
  * A set of simple points
  ***************************************************************/
 
 function kaXmlPointCloud( point ) 
 {
   kaXmlFeature.apply(this, [point]);
   
   if ( _BrowserIdent_hasCanvasSupport())
     kaXmlPointCloud.prototype['draw'] = kaXmlPointCloud.prototype['draw_canvas'];
   else
     kaXmlPointCloud.prototype['draw'] = function() {};   
   
   for (var p in kaXmlFeature.prototype) {
     if (!kaXmlPointCloud.prototype[p]) 
       kaXmlPointCloud.prototype[p] = kaXmlFeature.prototype[p];
   }
 }
 
 
 
 
 kaXmlPointCloud.prototype.draw_canvas = function(point) 
 {       
   if (point == null || this.xn == null) {
     OpenLayers.Console.warn("kaXmlPointCloud: point/coordinate is null", point, this);
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
   ctx.fillStyle = '#' + this.color2;
   ctx.globalAlpha = this.opacity;  

   var i;
   
   for (i=1; i<this.xn.length; i++) {
     ctx.beginPath();
     ctx.arc(this.xn[i]/scf, this.yn[i]/scf, 4, 0, Math.PI*4, true);  
     ctx.fill();
   }
   ctx.restore();
   
   function showTime(t)
      { return (t ? t.substring(8,10)+":"+t.substring(10,12) : ""); }    
}
   
   
   
kaXmlPointCloud.prototype.rescale = function(point) {
    this.draw(point);
}
   
   
   
   
   