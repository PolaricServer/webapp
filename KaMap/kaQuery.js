/**********************************************************************
 *
 * $Id: kaQuery.js,v 1.1.1.1 2006-10-20 10:49:46 oivindh Exp $
 *
 * purpose: a simple tool for supporting queries.  It just provides
 *          the user interface for defining the query point or 
 *          area and defers the actual query to the application
 *
 * originally by: Paul Spencer (pspencer@dmsolutions.ca)
 * most of it removed (need only simple click): LA7ECA Øyvind Hanssen
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
 **********************************************************************/

// the query event id
var KAMAP_QUERY = gnLastEventId ++;

// human names for the query types
var KAMAP_POINT_QUERY = 0;
var KAMAP_RECT_QUERY = 1;

/**
 * kaQuery constructor
 *
 * construct a new kaQuery object of a given type for a given kaMap instance
 *
 * oKaMap - a kaMap instance
 *
 * type - int, one of KAMAP_POINT_QUERY or KAMAP_RECT_QUERY.  If the type is
 *        KAMAP_POINT_QUERY then only point queries are allowed.  If the type
 *        is KAMAP_RECT_QUERY then point or rectangle queries are possible.
 */
function kaQuery( oKaMap, type ) {
    kaTool.apply( this, [oKaMap] );
    this.name = 'kaQuery';
    this.cursor = 'help';
    
    //this is the HTML element that is visible
    this.domObj = document.createElement( 'div' );
    this.domObj.style.position = 'absolute';
    this.domObj.style.top = '0px';
    this.domObj.style.left = '0px';
    this.domObj.style.width = '1px';
    this.domObj.style.height = '1px';
    this.domObj.style.zIndex = 100;
    this.domObj.style.visibility = 'hidden';
    this.domObj.style.border = '1px solid red';
    this.domObj.style.backgroundColor = 'white';
    this.domObj.style.opacity = 0.50;
    this.domObj.style.mozOpacity = 0.50;
    this.domObj.style.filter = 'Alpha(opacity=50)';
    this.kaMap.theInsideLayer.appendChild( this.domObj );

    this.startx = null;
    this.starty = null;
    
    this.type = type;
    
    for (var p in kaTool.prototype) {
        if (!kaQuery.prototype[p])
            kaQuery.prototype[p]= kaTool.prototype[p];
    }
};


/**
 * kaQuery.onmouseup( e )
 *
 * called when a mouse button is clicked over theInsideLayer.
 *
 * e - object, the event object or null (in ie)
 */
kaQuery.prototype.onclick = function(e) {
    e = (e)?e:((event)?event:null);
    
    var type = KAMAP_POINT_QUERY;
    
    var x = e.pageX || (e.clientX +
              (document.documentElement.scrollLeft || document.body.scrollLeft));
    var y = e.pageY || (e.clientY +
              (document.documentElement.scrollTop || document.body.scrollTop));
    var aPixPos = this.adjustPixPosition( x, y );
    this.startx=-aPixPos[0];
    this.starty=-aPixPos[1];
    var coords = this.kaMap.pixToGeo( this.startx, this.starty );
    
    this.kaMap.triggerEvent(KAMAP_QUERY, type, coords);  
        
    return false;
};
