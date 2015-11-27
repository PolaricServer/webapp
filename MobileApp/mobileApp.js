
 
 function setStatus(txt) {
     geopos.innerHTML = txt;
 }

 

 var viewportTab = [ 
     '<meta name="viewport" content="target-densitydpi=device-dpi*1.5 width=device-width, height=device-height">',
     '<meta name="viewport" content="target-densitydpi=device-dpi width=device-width, height=device-height">'
 ];
 
 var viewportDescr = ['1.5 X (standard)', '1.0 X ('+_('high resolution')+')'];
 
 
 function switchViewportRes() {
      var i = parseInt(storage['polaric.viewportIndex'], 10);
      i = (i + 1) % 2;
      if (isNaN(i))
        i = 0; 
      
      alert(_('Magnification')+': '+viewportDescr[i]);
      storage['polaric.viewportIndex'] = i.toString();
      location.reload();
 }

function getViewportRes() {
      var i = parseInt(storage['polaric.viewportIndex'], 10);
      $('head').append(viewportTab[i]); 
}


 /* For use inside an Android app. (using PhoneGap). */ 
 function myOnLoad_droid() {
   isMobile = isMobileApp = true;
   document.addEventListener("deviceready", function() {
     document.addEventListener("menubutton", function(e) { 
       if (popupActive()) 
          return menuMouseSelect(); 
       else 
         return showContextMenu(document.getElementById('toolbar'), e, 'MAIN'); 
     }, false);
     
     
     startUp(); 
     var d = document.getElementById('refToggler');
     toggleReference(d); 
     setStatus('&nbsp; '+_('PolaricDroid app ready'));
   }, false);
     
   
   
   window.addEventListener("orientationchange", function() 
     { location.reload(false); });
   
   
   
     function backButt(e)
       { menuMouseSelect(); e.cancelBubble = true;  }
     
     onPopup(
       function() { 
         document.addEventListener("backbutton", backButt, false); 
       }, 
             function() {
                document.removeEventListener("backbutton", backButt , false); 
             }  );              
 }
 
 