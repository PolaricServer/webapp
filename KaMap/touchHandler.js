 
 
 
 /**
  *  Try to map touch events to mouse events
  */
 
 function touchHandler() {
   this.tstate = null;
   this.cMenu = false;
   this.moving = false;
 };
 
 
 
 touchHandler.prototype.handle = function(event)
 {   
   var touches = event.changedTouches,
   first = touches[0],
   type = "";
   t = this;
   
   switch(event.type)
   {
     case "touchstart": 
       t.tstate = first;
       setTimeout( function() {
         if (t.tstate != null) {
           t.cMenu = true;
           sendEvent("contextmenu",t.tstate);
           t.tstate = null;
         }
       }, 700);        
           break;
           
     case "touchmove":  
       if (!t.moving) {
         t.moving = true; 
         sendEvent("mousedown",t.tstate);
       }
       sendEvent("mousemove",first);
       t.tstate = null; 
       break;        
       
     case "touchend":  
       if (t.tstate != null)
         sendEvent("click",first); 
       if (!t.cMenu) 
         sendEvent("mouseup",first);
       t.cMenu = false;
       t.tstate = null;
       t.moving = false;
       break;
       
     default: return;
   }
   event.preventDefault();
   event.cancelBubble = true;
   
   
   
   function sendEvent(type,ev) 
   {
     var simulatedEvent = document.createEvent("MouseEvent");
     simulatedEvent.initMouseEvent(type, true, true, window, 1,
                                   ev.screenX, ev.screenY,
                                   ev.clientX, ev.clientY, false,
                                   false, false, false, 0/*left*/, null);
     ev.target.dispatchEvent(simulatedEvent);
   }
 }
 
 