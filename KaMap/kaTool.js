/**********************************************************************
 *
 * $Id: kaTool.js,v 1.1.1.1 2006-10-20 10:49:46 oivindh Exp $
 *
 * purpose: an API for kaMap tools with a default navigation tool provided
 *
 * author: Paul Spencer (pspencer@dmsolutions.ca)
 *
 * The original kaTool code was written by DM Solutions Group.
 * Modified by LA7ECA, Øyvind Hanssen (2010)
 *
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

/*
 * includes code inspired by code in WindowManager.js
 * Copyright 2005 MetaCarta, Inc., released under the BSD License
 */

//globally 
var kaCurrentTool = null;

/**
 * @class
 * kaTool API.<br>
 * An API for building tools that work with kaMap.
 * To create a new tool, you need to have included this file first.  Next
 * create a function to instantiate your new tool.  All object construction
 * functions must include a parameter that references the kaMap object on which
 * they operate.<br>
 * The object construction function must call the kaTool constructor using the
 * following syntax:<br><br>
 * kaTool.apply( this, [oKaMap] );<br><br>
 * where oKaMap is the name of the parameter to the constructor function.
 * You should then set the tool's name (this.name) and overload any functions
 * for mouse handling etc.
 *
 * @constructor kaTool
 * kaTool is the base class for tools which operate on an instance of kaMap.
 * @param {Object} oKaMap the instance of kaMap on which this tool should operate
 */
function kaTool( oKaMap ) {
    /** the instance of kaMap on which this tool operates */
    this.kaMap = oKaMap;
    /** the name of this tool */
    this.name = 'kaTool';
    /** info tools get all events all the time */
    this.bInfoTool = false;
    
    // Default for mouse wheel: zoom in or out. (Mod D Badke)
    this.wheelPlus = new Array(oKaMap, oKaMap.zoomIn, null);
    this.wheelMinus = new Array(oKaMap, oKaMap.zoomOut, null);
    
    this.kaMap.registerTool( this );
};

/**
 * is this an info tool or a regular tool?
 */
kaTool.prototype.isInfoTool = function() {
    return this.bInfoTool;
};

/**
 * activate this tool.  Activating the tool causes any existing tools to be
 * deactivated.
 */
kaTool.prototype.activate = function() {
    this.kaMap.activateTool( this );
    document.kaCurrentTool = this;
};

/**
 * deactivate this tool.  
 */
kaTool.prototype.deactivate = function() {
    this.kaMap.deactivateTool( this );
    document.kaCurrentTool = null;
};

/**
 * handle mouse movement over the viewport of the kaMap.  This
  * method does nothing and should be overloaded by subclasses.
 * @param {Event} e the mouse event object
 */
kaTool.prototype.onmousemove = function(e) {
    return false;
};

/**
 * handle mouse down events on the viewport of the kaMap.  This
  * method does nothing and should be overloaded by subclasses.
 * @param {Event} e the mouse event object
 */
kaTool.prototype.onmousedown = function(e) {
    return false;
};

/**
 * handle mouse up events on the viewport of the kaMap.  This
  * method does nothing and should be overloaded by subclasses.
 * @param {Event} e the mouse event object
 */
kaTool.prototype.onmouseup = function(e) {
    return false;
};

/**
 * handle mouse doubleclicks on the viewport of the kaMap.  This
 * method does nothing and should be overloaded by subclasses.
 * @param {Event} e the mouse event object
 */
kaTool.prototype.ondblclick = function(e) {
    return false;
};

/**
 * Set the object and function to call when the mouse wheel
 * event triggers. The parameters are saved in the tool object
 * this is called for, and only affect that tool.
 * 
 * @param {array} plusSet  - parameters for positive wheel scroll
 * @param {array} minusSet - parameters for negative wheel scroll
 * 
 * plusSet and minusSet are arrays of structure:
 *   [0] - object to apply function for or null
 *   [1] - function to apply
 *   [2] - function arguments or null for no arguments
 * 
 * Set minusSet and/or plusSet to null to disable that scroll direction.
 * 
 * eg: --disable mouse wheel for navigator tool:
 * 				 myKaNavigator.setMouseWheel(null, null);
 * 
 *     --set navigator tool to zoom (same as default action):
 *         myKaNavigator.setMouseWheel([myKaMap, myKaMap.zoomIn, null],
 * 					 											     [myKaMap, myKaMap.zoomOut, null]);
 * 
 * (New D Badke)
 */
kaTool.prototype.setMouseWheel = function(minusSet, plusSet) {
	this.wheelMinus = minusSet;
	this.wheelPlus = plusSet;
};

/**
 * Handle mouse wheel events over the viewport of the kaMap.  This
 * applies a function set by the setMouseWheel function. If the function
 * is null, do nothing. (Mod D Badke)
 * 
 * @param {Event} e the mouse event object
 */
kaTool.prototype.onmousewheel = function(e) {
    e = (e)?e:((event)?event:null);
    var wheelDelta = e.wheelDelta ? e.wheelDelta : e.detail*-1;
    var wheelSet = null;
    if (wheelDelta > 0) 
    	wheelSet = this.wheelPlus;
    else
    	wheelSet = this.wheelMinus;
    
  	if (wheelSet) {
  		obj = (wheelSet[0]) ? wheelSet[0] : null;
  		func = (wheelSet[1]) ? wheelSet[1] : null;
  		args = (wheelSet[2]) ? wheelSet[2] : null;
  		if (func) {
			if (args) {
				func.apply(obj, args);
			} else{
			    func.apply(obj);
			}
  		}
    }
};

/**
 * FIXME
 * adjust a page-relative pixel position into a kaMap relative
 * pixel position
 *
 * @param {Integer} x the x page coordinate to convert
 * @param {Integer} y the y page coordinate to convert
 * @return {Array} return an array containing the converted coordinates
 */
kaTool.prototype.adjustPixPosition = function( x, y ) {
//    return [x,y];
    var obj = this.kaMap.domObj;
    var offsetLeft = 0;
    var offsetTop = 0;
    while (obj) {
        offsetLeft += parseInt(obj.offsetLeft);
        offsetTop += parseInt(obj.offsetTop);
        obj = obj.offsetParent;
    }
    
    var pX = parseInt(this.kaMap.theInsideLayer.style.left) + 
             offsetLeft - x;
    var pY = parseInt(this.kaMap.theInsideLayer.style.top) + 
             offsetTop - y;
             
    return [pX,pY];
};

/*
 * key press events are directed to the HTMLDocument rather than the
 * div on which we really wanted them to happen.  So we set the document
 * keypress handler to this function and redirect it to the kaMap core
 * keypress handler, which will eventually reach the onkeypress handler
 * of our current tool ... which by default is the keyboard navigation.
 *
 * To get the keyboard events in the first place, add the following when you
 * want the keypress events to be captured
 *
 * if (isIE4) document.onkeydown = kaTool_redirect_onkeypress;
 * document.onkeypress = kaTool_redirect_onkeypress;
 */
function kaTool_redirect_onkeypress(e) {
    if (document.kaCurrentTool) {
        document.kaCurrentTool.onkeypress(e);
    }
};

/**
 * handle keypress events.  Keypress events are normally dispatched
 * here rather than in a sub-class.
 * @param {Event} e the keypress event object
 */
kaTool.prototype.onkeypress = function(e) {
    e = (e)?e:((event)?event:null);
    if (e) {
        var charCode=(e.charCode)?e.charCode:e.keyCode;
        var b=true;
        var nStep = 16;
        switch(charCode) {
          case 38://up
            this.kaMap.moveBy(0,nStep);
            this.kaMap.triggerEvent( KAMAP_EXTENTS_CHANGED, this.kaMap.getGeoExtents() );
            break;
          case 40:
            this.kaMap.moveBy(0,-nStep);
            this.kaMap.triggerEvent( KAMAP_EXTENTS_CHANGED, this.kaMap.getGeoExtents() );
            break;
          case 37:
            this.kaMap.moveBy(nStep,0);
            this.kaMap.triggerEvent( KAMAP_EXTENTS_CHANGED, this.kaMap.getGeoExtents() );
            break;
          case 39:
            this.kaMap.moveBy(-nStep,0);
            this.kaMap.triggerEvent( KAMAP_EXTENTS_CHANGED, this.kaMap.getGeoExtents() );
            break;
          case 33:
            this.kaMap.slideBy(0, this.kaMap.viewportHeight/2);
            break;
          case 34:
            this.kaMap.slideBy(0,-this.kaMap.viewportHeight/2);
            break;
          case 36:
            this.kaMap.slideBy(this.kaMap.viewportWidth/2,0);
            break;
          case 35:
            this.kaMap.slideBy(-this.kaMap.viewportWidth/2,0);
            break;
          case 43: //ascii +
          case 61: //ascii =
            this.kaMap.zoomIn();
            break;
         case 45:
            this.kaMap.zoomOut();
            break;
          default:
            b=false;
        }
        if (b) {
            return this.cancelEvent(e);
        }
        return true;
    }
};

/**
 * handle the mouse moving over the kaMap viewport.  This is a method does
 * nothing and should be overloaded in a subclass
 * @param {Event} e the mouse event
 */
kaTool.prototype.onmouseover = function(e) {
    return false;
};

/**
 * handle the mouse leaving the kaMap viewport.  This is a method
 * releases the keypress handler and should be called from any
 * sub class that overloads this method.
 * @param {Event} e the mouse event
 */
kaTool.prototype.onmouseout = function(e) {
    if (this.kaMap.isIE4) {
        document.onkeydown = null;
    }
    document.onkeypress = null;
    return false;
};

/**
 * provide a cross-platform method of cancelling events, including
 * stopping of event bubbling and propagation.
 * @param {Event} e the event to cancel
 */
kaTool.prototype.cancelEvent = function(e) {
    e = (e)?e:((event)?event:null);
    e.cancelBubble = true;
    e.returnValue = false;
    if (e.stopPropogation) {
        e.stopPropogation();
    }
    if (e.preventDefault) {
        e.preventDefault();
    }
    return false;
};

/**
 * Construct a new kaNavigator instance on a given kaMap instance
 *
 * @class
 * kaNavigator is a general purpose navigation tool for kaMap instances.
 * It provides panning through click-and-drag, and various keyboard
 * navigation.
 *
 * @base kaTool
 * @constructor
 * @param {Object} oKaMap the kaMap instance to provide navigation for
 * @author Paul Spencer
 */

    /* NOTE: Most of Navigator tool is removed. We use OpenLayers instead */

function kaNavigator( oKaMap ) {
    kaTool.apply( this, [oKaMap] );
    /** the name of this tool */
    this.name = 'kaNavigator';
    /** the cursor to use */
    this.cursor = ["url('KaMap/images/grab.cur'),move", '-moz-grab', 'grab', 'move'];

    /** the image to use for this tool when it is active on the map */
    this.activeImage = this.kaMap.server + 'images/button_pan_3.png';

    /** the image to use for this tool when it is disabled */
    this.disabledImage = this.kaMap.server + 'images/button_pan_2.png';

    for (var p in kaTool.prototype) {
        if (!kaNavigator.prototype[p])
            kaNavigator.prototype[p]= kaTool.prototype[p];
    } 
};

/**
 * Dummy mouse event handlers
 */
kaNavigator.prototype.onmouseout = null; 
kaNavigator.prototype.onmousemove = null;
kaNavigator.prototype.onmousedown = null;
kaNavigator.prototype.onmouseup = null;
kaNavigator.prototype.onclick = function() {return true;};
kaNavigator.prototype.ondblclick = null; 

var gDblClickTimer = null;


kaNavigator.prototype.dispatchMapClicked = function(px,py) {
    var a = this.adjustPixPosition( px,py );
    var p = this.kaMap.pixToGeo( a[0],a[1] );
    gDblClickTimer=null;
    this.kaMap.triggerEvent(KAMAP_MAP_CLICKED, p);
};


//TODO: this is a temporary patch until we add prototype/scriptaculous support.
function bind(m,o) {
    var __method = arguments[0];
    var __object = arguments[1];
    var args = [];
    for (var i=2; i<arguments.length; i++) { args.push(arguments[i]) }
    return function() { return __method.apply(__object, args); }
}
