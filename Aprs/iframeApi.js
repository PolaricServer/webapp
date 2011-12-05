 
/* Identify the frame where Polaric Server runs */
var frame = document.getElementById('polaric').contentWindow;

function polaric_zoomIn()
{ frame.myKaMap.zoomIn(); }

function polaric_zoomOut()
{ frame.myKaMap.zoomOut(); }

function polaric_searchStations()
{ frame.searchStations(); }

function polaric_findStation(ident)
{ frame.findStation(ident); }