 
 
 /******************************************************************************
  * Event Manager class
  * originally part of kaMap.js by Paul Spencer (pspencer@dmsolutions.ca)
  *
  * an internal class for managing generic events.  kaMap! uses the event
  * manager internally and exposes certain events to the application.
  *
  * the kaMap class provides wrapper functions that hide this implementation
  * useage:
  *
  * myKaMap.registerForEvent( gnSomeEventID, myObject, myFunction );
  * myKaMap.registerForEvent( 'SOME_EVENT', myObject, myFunction );
  *
  * myKaMap.deregisterForEvent( gnSomeEventID, myObject, myFunction );
  * myKaMap.deregisterForEvent( 'SOME_EVENT', myObject, myFunction );
  *
  * myObject is normally null but can be a javascript object to have myFunction
  * executed within the context of an object (becomes 'this' in the function).
  *
  *****************************************************************************/
 
 function _eventManager( )
 {
   this.events = [];
   this.lastEventID = 0;
 }
 
 _eventManager.prototype.registerEventID = function( eventID ) {
   var ev = new String(eventID);
   if (!this.events[eventID]) {
     this.events[eventID] = [];
   }
 };
 
 _eventManager.prototype.registerForEvent = function(eventID, obj, func) {
   var ev = new String(eventID);
   this.events[eventID].push( [obj, func] );
 };
 
 _eventManager.prototype.deregisterForEvent = function( eventID, obj, func ) {
   var ev = new String(eventID);
   var bResult = false;
   if (!this.events[eventID]) {
     return false;
   }
   
   for (var i=0;i<this.events[eventID].length;i++) {
     
     if (this.events[eventID][i][0] == obj &&
       this.events[eventID][i][1] == func) {
       this.events[eventID].splice(i,1);
     bResult = true;
       }
   }
   return bResult;
 };
 
 _eventManager.prototype.triggerEvent = function( eventID ) {
   var ev = new String(eventID);
   if (!this.events[eventID]) {
     return false;
   }
   
   var args = new Array();
   for(i=1; i<arguments.length; i++) {
     args[args.length] = arguments[i];
   }
   
   for (var i=0; i<this.events[eventID].length; i++) {
     this.events[eventID][i][1].apply( this.events[eventID][i][0],
                                       arguments );
   }
   return true;
 };
 