 
 
 
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
 
 /* Display layers in a popup window */
 layerSwitcher.prototype.displayLayers = function(x, y) 
 { 
     var t = this;
     var w = popupwindow(myKaMap.domObj, generateForm(), x, y, null); 
     addHandlers();
     
     /* Handler to use when selecting base layer */
     function handleSelect(arg) {
       return function() {
          t.setBaseLayer(arg); 
          setTimeout(function() {
             myKaMap.evaluateLayers();
             w.innerHTML = generateForm();
             addHandlers();
          }, 100);
       } 
     }
     
     /* Handler to use when toggling overlay */  
     function handleToggle(arg) {return function() 
       { t.toggleOverlay(arg);} }
     
     
     /* Generate list of layers as HTML forms */
     function generateForm() {   
       var html = '<div id="layerSwitcher">';
        if (mapLayers != null && mapLayers.length > 0) {
          html+='<h2>'+_('Base layer')+'</h2><form>';
          for (var i=0; i < mapLayers.length; i++) { 
            if ( mapLayers[i].layer.displayInLayerSwitcher && mapLayers[i].layer.isBaseLayer) 
            {              
               /* Display radio button and text for base layer */
               html += '<input id="layer'+i+'" type="radio" name="layer" value="layer'+i+'"';
               if (mapLayers[i].layer.getVisibility()) html += ' checked';
               html += '> <span>'+mapLayers[i].layer.name+'</span><br>';
            }
          }
          html+='</form><h2>'+_('Overlays')+'</h2><form>';
          for (var i=0; i < mapLayers.length; i++)  
            if (!mapLayers[i].layer.isBaseLayer && mapLayers[i].layer.displayInLayerSwitcher) 
            {  
               /* Display tick button for overlay layer */
               html += '<input id="layer'+i+'" type="checkbox" name="overlay" value="layer'+i+'"';
               if (mapLayers[i].layer.getVisibility()) html += ' checked';
               html += '> <span>'+mapLayers[i].layer.name+'</span><br>';
            }
        }
        html += '</form></div>';
        return html;
     }
     
     /* Add click-handlers for each layer in list */
     function addHandlers() {
       for (var i=0; i < mapLayers.length; i++)
         if (mapLayers[i].layer.displayInLayerSwitcher) {
           if ( mapLayers[i].layer.isBaseLayer)
             $('#layer'+i).click( handleSelect(i) );
           else
             $('#layer'+i).click( handleToggle(i) );
         }
     }
 };
 
 