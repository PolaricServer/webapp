 
 
 var powerMgmt_locked = false; 
 
 /* This function must be called after the initialisation of the uid and 
  * the storage object 
  */
 function powerMgmt_init() {
   if ( storage['powermgmt_lock'] == 'true')
     powerMgmt_lock(); 
 }
 
 function powerMgmt_lock() {
    cordova.require('cordova/plugin/powermanagement').acquire(
        function(x) { powerMgmt_locked = true; storage['powermgmt_lock'] = 'true'; }, 
        function(x) { alert("Error: cannot acquire wake lock"); } ); 
 }
     
 function powerMgmt_unlock() {
    cordova.require('cordova/plugin/powermanagement').release(
        function(x) { powerMgmt_locked = false; storage['powermgmt_lock'] = 'false';}, 
        function(x) { alert("Error: cannot release wake lock"); } ); 
 }
 
 function setStatus(txt) {
     geopos.innerHTML = txt;
 }
 
 
 /* For use inside an Android app. (using PhoneGap). */ 
 function myOnLoad_droid() {
   isMobile = isMobileApp = true;   
   document.addEventListener("deviceready", function() {
     
     document.addEventListener("menubutton", function(e) { 
       if (popupActive())
         return menuMouseSelect(); 
       else
         return mainMenu(document.getElementById('toolbar'), e); 
       
     }, false);
         
//     ajax_setBasicAuth('xxxx', 'xxxxx');
     startUp(); 
     var d = document.getElementById('refToggler');
     toggleReference(d); 
     setStatus('&nbsp; PolaricDroid app ready');
   }, false);
     
     
     function backButt(e)
     { menuMouseSelect(); e.cancelBubble = true; }
     
     onPopup(
       function() { 
         document.addEventListener("backbutton", backButt, false); }, 
             function() {
               document.removeEventListener("backbutton", backButt , false); }  );              
 }
 
 