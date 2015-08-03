 
 
 
 function layerSwitcher(ka) {
   this.kaMap = ka;
 };
 
 
 layerSwitcher.prototype.setBaseLayer = function(i)
 {
    this.kaMap.olMap.setBaseLayer(mapLayers[i].layer);
 }
 
 
 layerSwitcher.prototype.toggleOverlay = function(i)
 {
    mapLayers[i].layer.setVisibility(
     !mapLayers[i].layer.getVisibility()
    );
 }
 
 
 layerSwitcher.prototype.displayLayers = function(x,y) 
 { 
   var html = '<div id="layerSwitcher">';
   if (mapLayers != null && mapLayers.length > 0) {
     html+='<h2>'+_('Base layer')+'</h2><form>';
     for (var i=0; i < mapLayers.length; i++) { 
       if ( mapLayers[i].layer.displayInLayerSwitcher &&
            mapLayers[i].layer.isBaseLayer) {
          /* Display radio button and text for base layer */
          html += '<input id="layer'+i+'" type="radio" name="layer" value="layer'+i+'"';
          if (mapLayers[i].layer.getVisibility()) html += ' checked';
          html += '> <span>'+mapLayers[i].layer.name+'</span><br>';
       }
     }
     html+='</form><h2>'+_('Overlays')+'</h2><form>';
     for (var i=0; i < mapLayers.length; i++)  
        if (!mapLayers[i].layer.isBaseLayer && mapLayers[i].layer.displayInLayerSwitcher) {
          /* Display tick button for overlay layer */
          html += '<input id="layer'+i+'" type="checkbox" name="overlay" value="layer'+i+'"';
          if (mapLayers[i].layer.getVisibility()) html += ' checked';
          html += '> <span>'+mapLayers[i].layer.name+'</span><br>';
         }
     }
     html += '</form></div>';
   
   
     var w = popupwindow(myKaMap.domObj, html, x, y, null); 
     
     for (var i=0; i < mapLayers.length; i++)
       if (mapLayers[i].layer.displayInLayerSwitcher) {
         var t = this;
         function f1(x) {return function() {t.setBaseLayer(x);}}
         function f2(x) {return function() {t.toggleOverlay(x);}}
    
         if ( mapLayers[i].layer.isBaseLayer)
             $('#layer'+i).click( f1(i) );
         else
             $('#layer'+i).click( f2(i) );
       }
 };
 
 