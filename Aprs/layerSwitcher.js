 /* Layer manager */
 
 
 function layerSwitcher(ka) {
   this.kaMap = ka;
   this.storage = null;
 };
 
 
 /* Get settings from persistent storage */
 layerSwitcher.prototype.getSettings = function()
 {
   var blayer = storage[uid+'.baselayer'];
   if (blayer != null)
     this.kaMap.setBaseLayerId(blayer); 
   for (var i=0; i < mapLayers.length; i++) { 
     var layer = mapLayers[i].layer;
     if (!layer.isBaseLayer && layer.displayInLayerSwitcher) { 
         var setting = storage[uid+'.layer.' + layer.name];
         layer.setVisibility( 
           (setting != null && setting == 'on') ); 
     }
   }         
 }
 
 
 layerSwitcher.prototype.setBaseLayer = function(i)
 {
    this.kaMap.olMap.setBaseLayer(mapLayers[i].layer);
    storage[uid+'.baselayer'] = mapLayers[i].layer.id
 }
 
 
 layerSwitcher.prototype.toggleOverlay = function(i)
 {
     var prev = mapLayers[i].layer.getVisibility(); 
     mapLayers[i].layer.setVisibility(!prev);
     storage[uid+'.layer.' + mapLayers[i].layer.name] = 
         (prev ? 'off' : 'on'); 
 }
 
 
 layerSwitcher.prototype.refreshOverlay = function()
 {
   for (var i=0;i<mapLayers.length; i++) {      
     var layer =  mapLayers[i].layer; 
     if (!layer.isBaseLayer && "refresh" in layer && layer.getVisibility())
       layer.refresh();
   }
 }
 
 
 /*
  * Re-evaluate what layers to be shown in layer switcher list. 
  */
 layerSwitcher.prototype.evaluateLayers = function() {
   var vlayer = -1; 
   if (mapLayers != null && mapLayers.length > 0) {
     for (var i=0; i < mapLayers.length; i++) { 
       var pred = mapLayers[i].predicate(); 
       var layer =  mapLayers[i].layer; 
       
       layer.displayInLayerSwitcher = pred;
       
       if (!layer.isBaseLayer) {
         var v = pred ? (storage[uid+'.layer.' + layer.name] == 'on') : false;
         layer.setVisibility(v);
      }
       
       if (layer.isBaseLayer && layer.getVisibility()) {
         layer.setVisibility(false);
         if (pred) 
           vlayer = i; 
       }
     }
     if (vlayer == -1) {
       for (var i=0; i < mapLayers.length; i++)  
         if (mapLayers[i].layer.isBaseLayer && mapLayers[i].layer.displayInLayerSwitcher) {
           this.kaMap.olMap.baseLayer = mapLayers[i].layer;
           this.kaMap.olMap.events.triggerEvent("changebaselayer");
           mapLayers[i].layer.setVisibility(true); 
           return;
         }
     }  
     else
       mapLayers[vlayer].layer.setVisibility(true);
   }
 };
 
 
 
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
             t.evaluateLayers();
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
 
 