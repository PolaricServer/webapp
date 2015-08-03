 
 function cancelBubble(e) {
   var evt = e ? e:window.event;
   if (evt.stopPropagation)    evt.stopPropagation();
   if (evt.cancelBubble!=null) evt.cancelBubble = true;
 }
 
 /**
  *  Try to map touch events to mouse events
  */
 
 function touchHandler() {
   this.tstate = null;
   this.cMenu = false;
   this.moving = false; 
   this.startx = 0;
   this.starty = 0;
 };
 
 
 touchHandler.prototype.handle = function(event)
 {   
   var touches = event.changedTouches,
   first = touches[0],
   type = "",
   t = this;
   event.clientX = touches[0].clientX; 
   event.clientY = touches[0].clientY;
   
   switch(event.type)
   {
       case "touchstart": 
         t.tstate = first;
         t.startx = event.clientX;
         t.starty = event.clientY;

         setTimeout( function() {
           if (t.tstate != null  && !t.moving) {
                t.cMenu = true;
                sendEvent("contextmenu", t.tstate);
                t.tstate = null;
           }
         }, 800);   
         break;
           
       case "touchmove":  
         if (!t.moving) { 
           if( event.clientX - t.startx > 10 || event.clientX - t.startx < -10 || 
               event.clientY - t.starty > 10 || event.clientY - t.starty < -10 ) {
              t.moving = true;        
              t.tstate = null; 
           }
           else
              cancelBubble();
         } 
         break;        
       
       case "touchend":
         if (!t.cMenu && !t.moving) {
            sendEvent("mouseup",first);
            sendEvent("click", first);
         }
         t.cMenu = false;
         t.tstate = null;
         t.moving = false;  
         break;

       default: return;
   }

   
   
   
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
 
 
