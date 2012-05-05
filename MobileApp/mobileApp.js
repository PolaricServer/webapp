 
 
 
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
 
 