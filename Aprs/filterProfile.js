 
 
/*
 * Uses global variables: 
 *    initialized,
 *    args,
 *    storage,
 *    myOverlay : startUp.js 
 *    filterViews : mapconfig.js
 */
 
function FilterProfile() {
   this.selected = defaultFilterView;
   this.sFilter = storage[uid+'.filter'];  
   this.initialized = false; 
   this.authorized = false; 
   this.done = false; 
}
 
 
FilterProfile.prototype.selectedProf = function() {
    return this.selected; 
}
 
 
FilterProfile.prototype.selectProfile = function(pname) {
  var t = this; 
   if (pname == this.selected)
      return;
   this.selected = pname; 
   if (initialized) {
      storage[uid+'.filter'] = pname;
      myOverlay.removePoint();
      getXmlData(false);
   }
   setTimeout(function() { t.updateMenu(); }, 500); 
}


FilterProfile.prototype.updateMenu = function() {
   for(var i in filterViews) {
      if (filterViews[i].name == this.selected) 
         document.forms[0].filters.selectedIndex = i;
  }
}
 
 
 
FilterProfile.prototype.init = function() {
    var t = this;
    var auth = isLoggedIn();
    if (t.done && auth == this.authorized)
        return;
        
    this.authorized = auth; 
    var flt = args['view'];
    if (flt)
       t.sFilter = flt;  
    if (t.sFilter==null)
       t.sFilter = defaultFilterView;
 
    var fSelect = document.forms[0].filters;
    if (fSelect) {
        j = 0;
        var selected = 0;
   
        /* Set up list of available filter profiles. 
         * filterViews is defined in mapconfig.js (config file) 
         */
        for(var i in filterViews) {
            var fv = filterViews[i];

            if (fv.name && fv.name.length > 1 && (!fv.restricted || auth)) {
                if (t.sFilter != null && t.sFilter == fv.name)  {
                   selected = j; 
                   t.selectProfile(t.sFilter);
                }
                fSelect[j++] = new Option(fv.title, fv.name, false, false);
            } 
        }
        fSelect.onchange = function() { t.selectProfile(fSelect[fSelect.selectedIndex].value); }
        if (selected >= j) 
             selected = 0;
        fSelect[selected].selected = true;
        t.done = true; 
    }
 }

 