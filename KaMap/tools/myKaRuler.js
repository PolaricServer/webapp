 
/**********************************************************************
 *
 *
 * purpose: a simple tool for measuring distance
 *
 * Original author: RIFF St�phane
 * Hacked by LA7ECA, Øyvind Hanssen
 *
 **********************************************************************
 *
 * Copyright (c) 2005, DM Solutions Group Inc.
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
 **********************************************************************
 *
 * To use this tool:
 *
 * 1) add a script tag to your page
 *
 * <script type="text/javascript" src="myKaRuler.js"></script>
 *
 * 2) create a new instance of myKaRuler
 *
 * myKaRuler = new myKaRuler( myKaMap);
 *
 * 3) provide some way of activating it.  This example would allow switching
 *    between querying and navigating.
 *
 * <input type="button" name="navigate" value="Navigate"
 *  onclick="myKaNavigator.activate()">
 * <input type="button" name="query" value="Query"
 *  onclick="myKaQuery.activate()">
 * <input type="button" name="ruler" value="Measuring"
 *  onclick="myKaRuler.activate()">
 *
 *
 *
 *****************************************************************************/

/**
 * myKaRuler constructor
 *
 * construct a new myKaRuler object of a given type for a given kaMap instance
 *
 * oKaMap - a kaMap instance
 *
 */
function myKaRuler( oKaMap ) {
    kaTool.apply( this, [oKaMap] );
    this.name = 'myKaRuler';
    this.cursor = 'default';
   
    this.ldiv = null;
    this.canvas = null;
    this.ctx = null;      
       
    //this is the HTML element that is visible
    this.domObj = document.createElement( 'div' );
    this.domObj.id = 'measureResult';
    this.domObj.style.position = 'absolute';
    this.domObj.style.top = '-300px';
    this.domObj.style.left = '-300px';
    this.domObj.style.zIndex = 300;
    this.domObj.style.visibility = 'hidden';
    document.body.appendChild( this.domObj );
    this.measureSeg = this.measureTot = null;
     
    // store the user clicks coordinates
    this.startx = null;
    this.starty = null;
    this.endx = null;
    this.endy = null;
    // the total polyline length
    this.total = 0.0;
    this.mouseDown = false;
    this.height = 0;
    this.width = 0;
    this.input = getRawObject('coords');

    for (var p in kaTool.prototype) {
        if (!myKaRuler.prototype[p])
            myKaRuler.prototype[p]= kaTool.prototype[p];
    }
};


/**
 * activate this tool.  Activating the tool causes any existing tools to be
 * deactivated.
 */
myKaRuler.prototype.activate = function() {
    this.kaMap.activateTool( this );
    document.kaCurrentTool = this;

    this.domObj.innerHTML 
       = "<label class='sleftlab'>Segment :</label> <input type='text' id='measureSeg'  />"
         +"<br><label class='sleftlab'>Totalt :</label> <input type='text' id='measureTot' />"       
         ;  
    this.measureSeg = document.getElementById("measureSeg"); 
    this.measureTot = document.getElementById("measureTot");   
    
    if(this.canvas == null)
       this.canvas = _BrowserIdent_newCanvas(this.kaMap.theInsideLayer);
    
    var vp = this.kaMap.domObj;   
    this.height = vp.clientHeight;
    this.width = vp.clientWidth;   
    _BrowserIdent_setCanvasHW(this.canvas, this.height, this.width); 
    ctx = _BrowserIdent_getCanvasContext(this.canvas);
    ctx.strokeStyle = '#f00'
    ctx.lineWidth = 3;
    this.clear();
    this.domObj.style.visibility = 'visible';
};


/**
 * deactivate this tool. 
 */
myKaRuler.prototype.deactivate = function() {
    this.kaMap.deactivateTool( this );
    this.clear();
    document.kaCurrentTool = null;

    this.kaMap.theInsideLayer.removeChild(this.canvas);
    this.canvas = null;
    this.domObj.style.visibility = 'hidden';
};


/*
 * draw line representing the measure.
 *
 */
myKaRuler.prototype.drawLine = function() {
    ctx.moveTo(this.startx, this.starty); 
    ctx.lineTo(this.endx, this.endy);
    ctx.stroke(); 
    this.startx = this.endx;
    this.starty = this.endy;
};


myKaRuler.prototype.reset = function() {
   if (document.kaCurrentTool != this)
      return;
   this.deactivate();
   this.activate();
}


myKaRuler.prototype.clear = function() {
   if (document.kaCurrentTool != this)
      return;
      
   ctx.clearRect(0, 0, this.width, this.height); 
   ctx.beginPath();  
   this.startx=this.starty=this.endx=this.endy=null;
   this.measureSeg.value="-";
   this.measureTot.value="-";
   this.total = 0.0;  
};


myKaRuler.prototype.showDist = function(x) {
   if (x > 1000)
       return Math.round(x/100)/10 +" km";
   else
       return Math.round(x) + " m";
}

myKaRuler.prototype.onclick = function(e) {
    return false;
};

/**
 * myKaRuler.onmouseout( e )
 *
 * called when the mouse leaves theInsideLayer.  hide the result box
 *
 * e - object, the event object or null (in ie)
 */
myKaRuler.prototype.onmouseout = function(e) {
    e = (e)?e:((event)?event:null);
    if (!e.target) e.target = e.srcElement;
        this.domObj.style.visibility='hidden';
};


/**
 * myKaRuler.onmouseout( e )
 *
 * called when the mouse leaves theInsideLayer.  show the result box
 *
 * e - object, the event object or null (in ie)
 */
myKaRuler.prototype.onmouseover = function(e) {
    e = (e)?e:((event)?event:null);
    if (!e.target) e.target = e.srcElement;
        this.domObj.style.visibility='visible';
};


/**
 * myKaRuler.onmousemove( e )
 *
 * called when the mouse moves over theInsideLayer.
 *
 * e - object, the event object or null (in ie)
 */


myKaRuler.prototype.onmousemove = function(e) {
    e = (e)?e:((event)?event:null);
   //show coordinate
    var x = e.pageX || (e.clientX +
          (document.documentElement.scrollLeft || document.body.scrollLeft));
    var y = e.pageY || (e.clientY +
          (document.documentElement.scrollTop || document.body.scrollTop));
      
    var geoCoo= this.kaMap.pixToGeo(x, y);    
    var gX = geoCoo[0];
    var gY = geoCoo[1];
    var gX= (parseInt(gX*10000))/10000;
    var gY= (parseInt(gY*10000))/10000;

    if(this.input)
    {
      if(this.kaMap.getCurrentMap().units == 'degrees')
          this.input.value = "Lon.: "+gX+" Lat.: "+gY;
      else
          this.input.value = "X: "+gX+" Y: "+gY;
    }
    //**//
    this.domObj.style.left = (e.clientX+5)+"px";
    this.domObj.style.top =  (e.clientY+5)+"px";

    if(this.startx !== null)
    {
       this.endx=x;
       this.endy=y;
       this.measureSeg.value =
         this.showDist(this.measureSphericalDistance2Points(this.startx,this.starty,this.endx,this.endy));
    }
    if (this.mouseDown)
       this.onmousedown(e);
    return false;
};



/**
 * myKaRuler.onmousedown( e )
 *
 * called when a mouse button is pressed over theInsideLayer.
 *
 * e - object, the event object or null (in ie)
 */
myKaRuler.prototype.onmousedown = function(e) {
    e = (e)?e:((event)?event:null);
    if (e.button==2) {
        this.clear();
        return this.cancelEvent(e);
    } else {
        if (this.kaMap.isIE4) document.onkeydown = 
             kaTool_redirect_onkeypress;
        document.onkeypress = kaTool_redirect_onkeypress;
       
        var x = e.pageX || (e.clientX +
              (document.documentElement.scrollLeft || 
               document.body.scrollLeft));
        var y = e.pageY || (e.clientY +
                (document.documentElement.scrollTop || 
                 document.body.scrollTop));                
       if(this.endx == null)
       {
           this.startx=this.endx=x;
           this.starty=this.endy=y;
       }
       else
       {
           this.endx=x;
           this.endy=y;
       }
               
       this.total += 
          this.measureSphericalDistance2Points(this.startx,this.starty,this.endx,this.endy);

       this.total = parseInt(this.total*100)/100;
       this.measureTot.value = this.showDist(this.total);
       this.drawLine();
       
        e.cancelBubble = true;
        e.returnValue = false;
        if (e.stopPropogation) e.stopPropogation();
        if (e.preventDefault) e.preventDefault();
        this.mouseDown = true; 
        return false;
    }
};

/**
 * myKaRuler.onmouseup( e )
 *
 * called when a mouse button is clicked over theInsideLayer.
 *
 * e - object, the event object or null (in ie)
 */
myKaRuler.prototype.onmouseup = function(e) {
    e = (e)?e:((event)?event:null);
    this.mouseDown = false;
    return false;
};

/**
* myKaRuler.measureSphericalDistance2Points
*
* pix1,piy1 - pixel coordinates of the first point
* pix2,piy2 - pixel coordinates of the second point
*
* This function is used to calculate the distance between two points in decimel degree unit.
* It assume that the earth is a perfect sphere, so the calculation isn't accurate.
* But probably accurate enough (0.5%). 
*/
myKaRuler.prototype.measureSphericalDistance2Points = 
function(pix1, piy1, pix2, piy2)
{
    var pt1 = this.kaMap.pixToGeo(pix1, piy1);
    var pt2 = this.kaMap.pixToGeo(pix2, piy2);
    /* Convert all the degrees to radians */
    var la1 = pt1[1] * Math.PI/180.0;
    var lo1 = pt1[0] * Math.PI/180.0;
    var la2 = pt2[1] * Math.PI/180.0;
    var lo2 = pt2[0] * Math.PI/180.0;
    
    /* Find the Great Circle distance */
    var EARTH_RADIUS = 6371000;
    var distance = 
    Math.acos(Math.sin(la1) * Math.sin(la2) + Math.cos(la1) * Math.cos(la2) * Math.cos(lo2-lo1)) 
     * EARTH_RADIUS ;
    
     return distance ;
};

