 
 
/*
 * Uses global variables: 
 *    initialized,
 *    args,
 *    storage,
 *    myOverlay : startUp.js 
 *    filterViews : mapconfig.js
 */
 
function FilterProfile() {
   this.sFilter = storage[uid+'.filter'];  
   this.initialized = false; 
   this.done = false; 
   this.filterMenu = null;
   this.init();
}
 
 
FilterProfile.prototype.selectedProf = function() {
    return this.sFilter; 
}
 
 
FilterProfile.prototype.selectProfile = function(pname) {
   var t = this; 
   if (pname != t.sFilter || !t.done) {
      t.sFilter = pname; 
      if (t.done) {
         storage[uid+'.filter'] = pname;
         myOverlay.removePoint();
         getXmlData(false);
      }
      t.updateMenu(); 
   }
}



FilterProfile.prototype.updateMenu = function() {
   for(var i in filterViews) {
      if (filterViews[i].name == this.sFilter) {
         $('div#filterChoice').html(filterViews[i].title);
         break;
      }
   } 
}
 
 
 
FilterProfile.prototype.init = function() {
    var t = this;
    if (t.done)
        return;
        
    var flt = args['view'];
    if (flt)
       t.sFilter = flt;  
    if (t.sFilter==null)
       t.sFilter = defaultFilterView;

     if (!t.done) ctxtMenu.addCallback('FILTERS', function (m) 
     {
        for(var i in filterViews) {
           var fv = filterViews[i];
           if (fv.name && fv.name.length > 1 && (!fv.restricted || isLoggedIn())) 
              m.add(fv.title, function(x) { t.selectProfile(x); }, fv.name);
           
        }
      });
      addContextMenu('filterMenu', 'FILTERS');
      t.selectProfile(t.sFilter);
      t.done = true; 
 }

 