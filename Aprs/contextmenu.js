 
 /************************************************************************
  * CONTEXT MENU CLASS
  ************************************************************************/
 
 function ContextMenu()
 {
   this.callbacks = new Array(); 
   this.txt = new PopupMenu(null);
 }
 
 
 
 /* 
  * Register a callback function that adds menu-items to some context. 
  * Can be called by plugin code.
  * If context exists, the function will typically add to existing menu items. 
  * 
  * Builtin contexts are 'MAP', 'ITEM', SIGN or 'TOOLBAR' 
  */
 
 ContextMenu.prototype.addCallback = function (context, func)
 {
   if (!this.callbacks[context])
     this.callbacks[context] = new Array();
   this.callbacks[context].push(func);
 }
 
 
 
 /*
  * Show the menu for a context
  * i identifier
  * e event object
  * ax and ay position on screen
  */ 
 ContextMenu.prototype.show = function (i, e, ax, ay)
 {
   var context = ident = i;
   e = (e)?e:((event)?event:null); 
   var x = (ax) ? ax : ((e.pageX) ? e.pageX : e.clientX); 
   var y = (ay) ? ay : ((e.pageY) ? e.pageY : e.clientY);
   var t = this; 
   var d = myKaMap.domObj;
   var p = myOverlay.getPointObject(ident);
   t.txt.clear();
   t.txt.ident = ident;
   t.txt.x = x;
   t.txt.y = y; 
   t.txt.p = p;
   
   /* Click on map */
   if (ident == null) {   
     context = 'MAP';
   }
   
   /* Click on item/sign on map overlay */
   else if (p != null)
     if (p.isSign) 
        context = 'SIGN';
     else
        context = 'ITEM';
     
   
   _doCallback(context);
   e.cancelBubble = true;       
   menuMouseSelect();                      
   this.txt.activate(d,x, y);
   
   
   /*
    * Internal function that executes plugin callbacks
    */
   function _doCallback(ctxt)
   {
     var lst = t.callbacks[ctxt]; 
     if (lst)
       for (i=0; i<lst.length; i++) {
         f = lst[i]; 
         if (f != null) 
           f(t.txt); 
       }    
   }
 } 

 /******************** End of Context menu class  **********************/
 
 
 /* Convenience function to use as event handler */
 
 function showContextMenu(icn, e, ctxt)
 {
   e = (e)?e:((event)?event:null);
   x = icn.offsetLeft + 10; 
   y = icn.offsetTop + icn.offsetHeight - 2;
   ctxtMenu.show(ctxt, e, x, y);
   e.cancelBubble = true;   
   return false; 
 }
 

 function addContextMenu(domId, name)
 {
    var element = document.getElementById(domId);
    element.onclick = function(e)       
        { return showContextMenu(element, e, name); }
    element.oncontextmenu = function(e) 
        { return showContextMenu(element, e, name); }
 }
 