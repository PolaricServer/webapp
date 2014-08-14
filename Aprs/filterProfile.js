 
 
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
   this.filterMenu = null;
   this.init();
}
 
 
FilterProfile.prototype.selectedProf = function() {
    return this.selected; 
}
 
 
FilterProfile.prototype.selectProfile = function(pname) {
   var t = this; 
   if (pname == this.selected)
      return;
   this.selected = pname; 
   if (t.done) {
      storage[uid+'.filter'] = pname;
      myOverlay.removePoint();
      getXmlData(false);
   }
   t.updateMenu(); 
}



FilterProfile.prototype.updateMenu = function() {
   for(var i in filterViews) {
      if (filterViews[i].name == this.selected) {
         $('div#filterChoice').html(filterViews[i].title);
         break;
      }
   } 
}
 
 
 
FilterProfile.prototype.init = function() {
    var t = this;
    var auth = isLoggedIn();
    if (t.done && auth == t.authorized)
        return;
        
    t.authorized = auth; 
    var flt = args['view'];
    if (flt)
       t.sFilter = flt;  
    if (t.sFilter==null)
       t.sFilter = defaultFilterView;
        
     if (!t.done) ctxtMenu.addCallback('FILTERS', function (m) 
     {
        for(var i in filterViews) {
           var fv = filterViews[i];
           if (fv.name && fv.name.length > 1 && (!fv.restricted || auth)) 
              m.add(fv.title, function(x) { t.selectProfile(x); }, fv.name);
        }
      });
      addContextMenu('filterMenu', 'FILTERS');
      t.selectProfile(t.sFilter);
      t.done = true; 
 }

 