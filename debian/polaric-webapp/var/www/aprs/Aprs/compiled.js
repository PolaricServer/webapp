Proj4js.defs["EPSG:32633"]="+proj=utm +zone=33 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
function add_Gpx_Layer(a,b){var c=new OpenLayers.Format.GPX,d=new OpenLayers.StyleMap(OpenLayers.Util.applyDefaults({strokeColor:"blue",strokeWidth:2,strokeOpacity:0.8,externalGraphic:"images/point.gif",graphicOpacity:0.9,graphicWidth:22,graphicHeight:22,strokeDashstyle:"solid"},OpenLayers.Feature.Vector.style["default"])),e=new OpenLayers.Layer.Vector(a,{styleMap:d});OpenLayers.loadURL(b,null,null,function(a){for(var a=c.read(a.responseText),b=0;b<a.length;b++)a[b].geometry.transform(new OpenLayers.Projection("EPSG:4326"),
new OpenLayers.Projection("EPSG:32633"));e.addFeatures(a)},function(){alert("Kunne ikke lese GPX-fil...")});e.setVisibility(!1);return e};var ie=document.all,ns6=document.getElementById&&!document.all,allowedPopups=1,isMenu=!1,activepopup=null,psubdiv=null,myScroll=null;function menuMouseSelect(){return allowedPopups<=0?(removePopup(),myScroll!=null&&myScroll.destroy(),myScroll=null,!1):!0}function _executeItem(a,b){removePopup();b()}
function _createItem(a,b){var c=document.createElement("div");c.origCls="";c.onmouseup=function(){_executeItem(c,b)};c.onmousedown=function(){_executeItem(c,b)};c.onmouseover=function(){c.origCls=c.className;c.className+=" ITEM_hover"};c.onmouseout=function(){c.className=c.origCls};c.appendChild(document.createTextNode(a));return c}
function _createMenu(a){var b=document.createElement("div"),c=null;b.style.display="none";b.className="POPUPMENU";for(i in a)a[i]==null?c.className="ITEM_sep":(c=_createItem(a[i][0]==null?"":a[i][0],a[i][1]==null?"":a[i][1]),b.appendChild(c));c.className="ITEM_last";return b}function removePopup(){if(activepopup!=null)isMenu=!1,allowedPopups++,activepopup.style.display="none",activepopup.parentNode.removeChild(activepopup)}function popupmenu(a,b,c,d,e){isMenu=!0;popup(a,_createMenu(b,c),d,e,!1)}
function popupwindow(a,b,c,d,e,g,f){var h=document.createElement("div");h.className="POPUP";h.innerHTML=b;if(g!=null)h.id=g;f?setTimeout(function(){popup(a,h,c,d,e)},700):popup(a,h,c,d,e);h.onmousedown=function(a){(a?a:event?event:null).cancelBubble=!0;return null};h.onmouseup=function(a){(a?a:event?event:null).cancelBubble=!0;return null};h.onclick=function(a){(a?a:event?event:null).cancelBubble=!0;return null};h.onmousemove=function(a){(a?a:event?event:null).cancelBubble=!0;return null};return h}
function remotepopupwindow(a,b,c,d,e){call(b,null,function(b){popupwindow(a,b,c,d,!1,e,!1)})}function remotepopupwindowCSS(a,b,c,d,e){call(b,null,function(b){b=popupwindow(a,b,1,1,!1,null,!1);if(e!=null)b.className=e})}
function popup(a,b,c,d,e){if(!(allowedPopups<=0)){var g;psubdiv=activepopup=b;if(e!=null&&e)g=document.createElement("img"),activepopup.appendChild(g),g.src="images/cross.gif",g.style.position="absolute",g.style.left="-9px",g.style.top="-12px",g.style.zIndex=1001,activepopup=document.createElement("div"),activepopup.appendChild(psubdiv),activepopup.onclick=function(){psubdiv.style.display="none"};a.appendChild(activepopup);e=e=0;activepopup.style.position="absolute";activepopup.style.display="block";
activepopup.style.padding="2px";activepopup.style.cursor="default";b.clientHeight+10>document.body.clientHeight?(activepopup.style.maxHeight=document.body.clientHeight-5+"px",b.id="wrapper",isMobile?setTimeout(function(){myScroll=new iScroll("wrapper")},1E3):activepopup.style.overflowY="scroll"):activepopup.style.overflowY="visible";e=c+10+b.clientWidth-document.body.clientWidth;if(e>0&&(c-=e,g!=null))g.style.left=e-9+"px";e=d+5+b.clientHeight-document.body.clientHeight;if(e>0&&(d-=e,g!=null))g.style.top=
e-12+"px";activepopup.style.left=c+"px";activepopup.style.top=d+"px";activepopup.style.zIndex=1E3;ie||(b=document.createEvent("MouseEvents"),b.initMouseEvent("mouseup",!0,!0,window,c,d,c,d,220,!1,!1,!0,!1,0,null),a.dispatchEvent(b));allowedPopups--}};var toolbar=document.getElementById("toolbar");
function showContextMenu(a,b,c,d){var b=b?b:event?event:null,e=c?c:b.pageX?b.pageX:b.clientX,g=d?d:b.pageY?b.pageY:b.clientY,c=myOverlay.getPointObject(a),d=myKaMap.domObj;if(a==null){var f=[["Vis kartreferanse",function(){setTimeout("showPosInfoPix("+e+", "+g+");",100)}]];canUpdate()&&f.push(["Legg p\u00e5 APRS objekt",function(){editObjectInfo(e,g)}]);f.push(null);f.push(["Sentrer punkt",function(){myZoomTo(e,g)}]);f.push(["Zoom inn",function(){myZoomTo(e,g);myKaMap.zoomIn()}]);f.push(["Zoom ut",
function(){myKaMap.zoomOut()}])}else a=="TOOLBAR"?(d=toolbar,f=[["Finn APRS stasjon",function(){setTimeout("searchStations();",100)}],["Finn kartreferanse",function(){setTimeout("showRefSearch();",100)}]],canUpdate()&&(f.push(["Legg inn objekt",function(){editObjectInfo(null,null)}]),f.push(["Slett objekt",function(){deleteObject(null)}])),f.push(null),traceIsHidden("ALL")?f.push(["Vis sporlogger",function(){myOverlay.showPointTrace("ALL")}]):f.push(["Skjul sporlogger",function(){myOverlay.hidePointTrace("ALL")}]),
f.push(null),f.push(["Zoom inn",function(){myKaMap.zoomIn()}]),f.push(["Zoom ut",function(){myKaMap.zoomOut()}]),isAdmin()|canUpdate()&&(f.push(null),f.push(["SAR URL",sarUrl]),f.push(["SAR modus",sarModeWindow])),isAdmin()&&f.push(["Server info (admin)",adminWindow])):(f=[["Vis info",function(){showStationInfo(a,!1,e,g)}]],c!=null&&c.hasTrace&&f.push(["Siste bevegelser",function(){showStationHistory(a,e,g)}]),canUpdate()&&(f.push(["Globale innstillinger",function(){showStationInfo(a,!0)}]),c!=null&&
(c.own?f.push(["Slett objekt",function(){deleteObject(a)}]):f.push(["Nullstill info",function(){resetInfo(a)}]))),f.push(null),f.push(["Auto-sporing "+(isTracked(a)?"AV":"P\u00c5"),function(){toggleTracked(a)}]),labelIsHidden(a)?f.push(["Vis ident",function(){showPointLabel(a)}]):f.push(["Skjul ident",function(){hidePointLabel(a)}]),hasTrace(a)&&(traceIsHidden(a)?f.push(["Vis spor",function(){myOverlay.showPointTrace(a)}]):f.push(["Skjul spor",function(){myOverlay.hidePointTrace(a)}])));b.cancelBubble=
!0;menuMouseSelect();popupmenu(d,f,null,e,g)}function mainMenu(a,b){b=b?b:event?event:null;x=a.offsetLeft+10;y=a.offsetTop+a.offsetHeight-2;showContextMenu("TOOLBAR",b,x,y);b.cancelBubble=!0;return!1}
function findStation(a,b){call(server_url+"srv/findstation?id="+a,null,function(a){if(a!=null){var d=a.split(/\s*,\s*/g);if(!(d==null||d.length<3)){var e=parseInt(d[1],10),g=parseInt(d[2],10);!isNaN(e)&&!isNaN(g)&&(myKaMap.zoomTo(e,g),removePopup(),b&&setTimeout(function(){showStationInfoGeo(d[0],!1,e,g)},1400),setTimeout(function(){var a=myOverlay.getPointObject(d[0]);a!=null&&a.moveToFront()},3500))}}},!1)}
function showStationInfoGeo(a,b,c,d){b=myKaMap.geoToPix(c,d);showStationInfo(a,!1,b[0]+12,b[1]+10)}function editObjectInfo(a,b){var c=myKaMap.pixToGeo(a,b);WOOpenWin("Objekt",server_url+"srv/addobject"+(a==null?"":"?x="+c[0]+"&y="+c[1]),"resizable=yes,scrollbars=yes, width=495, height=280")}function deleteObject(a){WOOpenWin("Objekt",server_url+"srv/deleteobject"+(a==null?"":"?objid="+a),"resizable=yes,scrollbars=yes, width=350, height=200")}
function resetInfo(a){WOOpenWin("Stasjon",server_url+"srv/resetinfo"+(a==null?"":"?objid="+a),"resizable=yes,scrollbars=yes, width=350, height=200")}function deleteAllObjects(){WOOpenWin("Objekt",server_url+"srv/deleteallobj","resizable=yes,scrollbars=yes, width=350, height=230")}function adminWindow(){WOOpenWin("Admin",server_url+"srv/admin?cmd=info","resizable=yes,scrollbars=yes, width=630, height=460")}
function sarModeWindow(){WOOpenWin("SarMode",server_url+"srv/sarmode","resizable=yes,scrollbars=yes, width=460, height=250")}function showStationInfo(a,b,c,d){b?(c=server_url+(getLogin()?"srv/sec-station?id=":"srv/station?id="),WOOpenWin("Stasjon",c+a+(b?"&edit=true":""),"resizable=yes,scrollbars=yes, width=705, height=450")):remotepopupwindow(myKaMap.domObj,server_url+"srv/station?simple=true&id="+a+(b?"&edit=true":""),c,d,"infopopup")}
function sarUrl(){var a=document.getElementById("permolink").children[0].children[0].href;remotepopupwindow(myKaMap.domObj,server_url+"srv/sarurl?url="+escape(a),50,80)}function showStationHistory(a,b,c){remotepopupwindow(document.getElementById("anchor"),server_url+"srv/history?simple=true&id="+a,b,c)}
function searchStations(){function a(a){if(a!=null){var g=isMobile?document.getElementById("searchform"):document.getElementById("searchresult");if(g!=null)g.innerHTML=a,removePopup(),popup(document.getElementById("anchor"),d,b,c,null)}}var b=50,c=70,d=popupwindow(document.getElementById("anchor"),' <div><h1>Finn APRS stasjon/objekt:</h1><hr><div id="searchform"><form>  Tekst i ident/komment: <input type="text"  width="10" id="findcall"/>  <input id="searchbutton" type="button" value="S\u00f8k" /></form><br><div id="searchresult"></div></div></div>',
b,c,null);document.getElementById("searchbutton").onclick=function(b){var c=document.getElementById("findcall").value;b.cancelBubble=!0;b.stopPropagation&&b.stopPropagation();call(server_url+"srv/search?filter="+c,null,a,!1)}}var downStrokeField;function autojump(a,b){var c=document.getElementById(a);c.nextField=document.getElementById(b);c.onkeydown=autojump_keyDown;c.onkeyup=autojump_keyUp}function autojump_keyDown(){this.beforeLength=this.value.length;downStrokeField=this}
function autojump_keyUp(){this==downStrokeField&&this.value.length>this.beforeLength&&this.value.length>=this.maxLength&&this.nextField.focus();downStrokeField=null}
function showRefSearch(){var a=myKaMap.getGeoExtents(),a=new UTMRef((a[0]+a[2])/2,(a[1]+a[3])/2,this.utmnzone,this.utmzone),a=a.toLatLng().toUTMRef();popupwindow(myKaMap.domObj,'<h1>Vis kartreferanse p\u00e5 kartet</h1><form><hr><span class="sleftlab">Kartref: </span><input id="locx" type="text" size="3" maxlength="3"><input id="locy" type="text" size="3" maxlength="3">&nbsp;<input type="button"    onclick="doRefSearchLocal(document.getElementById(\'locx\').value, document.getElementById(\'locy\').value)"   value="Finn">&nbsp;<br><hr><span class="sleftlab">UTM: </span><input id="utmz" type="text" size="2" maxlength="2" value="'+a.lngZone+
'"><input id="utmnz" type="text" size="1" maxlength="1" value="'+a.latZone+'">&nbsp;&nbsp<input id="utmx" type="text" size="6" maxlength="6"><input id="utmy" type="text" size="7" maxlength="7">&nbsp;<input type="button"    onclick="doRefSearchUtm(document.getElementById(\'utmx\').value, document.getElementById(\'utmy\').value,      document.getElementById(\'utmnz\').value, document.getElementById(\'utmz\').value)"   value="Finn">&nbsp;<br><hr><nobr><span class="sleftlab">LatLong: </span><input id="ll_Nd" type="text" size="2" maxlength="2">\u00b0&nbsp;<input id="ll_Nm" type="text" size="6" maxlength="6">\'N&nbsp;&nbsp;<input id="ll_Ed" type="text" size="2" maxlength="2">\u00b0&nbsp;<input id="ll_Em" type="text" size="6" maxlength="6">\'E&nbsp;<input type="button"    onclick="doRefSearchLatlong(document.getElementById(\'ll_Nd\').value, document.getElementById(\'ll_Nm\').value,         document.getElementById(\'ll_Ed\').value, document.getElementById(\'ll_Em\').value)"   value="Finn">&nbsp;</nobr></form><br>',
50,80,!1);autojump("utmz","utmnz");autojump("utmnz","utmx");autojump("utmx","utmy");autojump("locx","locy");autojump("ll_Nd","ll_Nm");autojump("ll_Nm","ll_Ed");autojump("ll_Ed","ll_Em")}function doRefSearchLatlong(a,b,c,d){removePopup();var a=parseInt(a,10),b=parseFloat(b),c=parseInt(c,10),d=parseFloat(d),e=(new LatLng(a+b/60,c+d/60)).toUTMRef().toLatLng().toUTMRef(this.utmnzone,this.utmzone);myKaMap.zoomTo(e.easting,e.northing);setTimeout(function(){showPosInfoUtm(e)},1500)}
function doRefSearchUtm(a,b,c,d){removePopup();a=parseInt(a,10);b=parseInt(b,10);d=parseInt(d,10);if(!isNaN(a)&&!isNaN(b)&&!isNaN(d)){var e=(new UTMRef(a,b,c,d)).toLatLng().toUTMRef(this.utmnzone,this.utmzone);myKaMap.zoomTo(e.easting,e.northing);setTimeout(function(){showPosInfoUtm(e)},1500)}}
function doRefSearchLocal(a,b){removePopup();var c=parseInt(a,10),d=parseInt(b,10);if(!isNaN(c)&&!isNaN(d)){var e=myKaMap.getGeoExtents(),e=new UTMRef((e[0]+e[2])/2,(e[1]+e[3])/2,this.utmnzone,this.utmzone),e=e.toLatLng().toUTMRef(),g=(new UTMRef(Math.floor(e.easting/1E5)*1E5+c*100,Math.floor(e.northing/1E5)*1E5+d*100,e.latZone,e.lngZone)).toLatLng().toUTMRef(this.utmnzone,this.utmzone);myKaMap.zoomTo(g.easting,g.northing);setTimeout(function(){showPosInfoUtm(g)},1500)}}
function showDMstring(a){deg=Math.floor(a);minx=a-deg;a<0&&minx!=0&&(minx=1-minx);mins=Math.round(minx*6E3)/100;return""+deg+"\u00b0 "+mins+"'"}function showPosInfoPix(a,b){var c=myKaMap.pixToGeo(a,b);showPosInfo(c)}function showPosInfo(a){showPosInfoUtm(new UTMRef(a[0],a[1],this.utmnzone,this.utmzone))}
function showPosInfoUtm(a){var b=a.toLatLng(),c=""+b.toUTMRef(),c=c.substring(0,5)+'<span class="kartref">'+c.substring(5,8)+"</span>"+c.substring(8,13)+'<span class="kartref">'+c.substring(13,16)+"</span>"+c.substring(16),d=myKaMap.geoToPix(a.easting,a.northing),a=popupwindow(myKaMap.domObj,'<span class="sleftlab">UTM:</span>'+c+'<br><nobr><span class="sleftlab">Latlong:</span>'+showDMstring(b.lat)+"N, "+showDMstring(b.lng)+'E<br></nobr><span class="sleftlab">Loc:</span>'+ll2Maidenhead(b.lat,b.lng),
d[0],d[1],!0);if(canUpdate())b=a.appendChild(document.createElement("hr")),b.style.marginBottom="0",b.style.marginTop="0.2em",a.appendChild(_createItem("Opprett APRS objekt her",function(){editObjectInfo(d[0],d[1]);menuMouseSelect()})).style.width="12em"};function LatLng(a,b){this.lat=a;this.lng=b;this.distance=LatLngDistance;this.toOSRef=LatLngToOSRef;this.toUTMRef=LatLngToUTMRef;this.WGS84ToOSGB36=WGS84ToOSGB36;this.OSGB36ToWGS84=OSGB36ToWGS84;this.toString=LatLngToString}function LatLngToString(){return"("+Math.round(this.lat*100)/100+", "+Math.round(this.lng*100)/100+")"}function OSRef(a,b){this.easting=a;this.northing=b;this.toLatLng=OSRefToLatLng;this.toString=OSRefToString;this.toSixFigureString=OSRefToSixFigureString}
function OSRefToString(){return"("+this.easting+", "+this.northing+")"}function OSRefToSixFigureString(){var a=Math.floor(this.easting/1E5),b=Math.floor(this.northing/1E5),c="",c=b<5?a<5?"S":"T":b<10?a<5?"N":"O":"H",d="",d=65+(4-b%5)*5+a%5;d>=73&&d++;var d=chr(d),a=Math.floor((this.easting-1E5*a)/100),b=Math.floor((this.northing-1E5*b)/100),e=a;a<100&&(e="0"+e);a<10&&(e="0"+e);a=b;b<100&&(a="0"+a);b<10&&(a="0"+a);return c+d+e+a}
function UTMRef(a,b,c,d){this.easting=a;this.northing=b;this.latZone=c;this.lngZone=d;this.toLatLng=UTMRefToLatLng;this.toString=UTMRefToString}function UTMRefToString(){return this.lngZone+this.latZone+" "+Math.round(this.easting)+" "+Math.round(this.northing)}function RefEll(a,b){this.maj=a;this.min=b;this.ecc=(a*a-b*b)/(a*a)}function sinSquared(a){return Math.sin(a)*Math.sin(a)}function cosSquared(a){return Math.cos(a)*Math.cos(a)}function tanSquared(a){return Math.tan(a)*Math.tan(a)}
function sec(a){return 1/Math.cos(a)}function deg2rad(a){return a*(Math.PI/180)}function rad2deg(a){return a*(180/Math.PI)}function chr(a){a=a.toString(16);a.length==1&&(a="0"+a);return unescape("%"+a)}function ord(a){var a=a.charAt(0),b;for(b=0;b<256;++b){var c=b.toString(16);c.length==1&&(c="0"+c);c="%"+c;c=unescape(c);if(c==a)break}return b}
function LatLngDistance(a){var b=deg2rad(this.lat),c=deg2rad(a.lat),d=deg2rad(this.lng),e=deg2rad(a.lng),a=6366.707*Math.cos(d)*Math.sin(b),d=6366.707*Math.sin(d)*Math.sin(b),b=6366.707*Math.cos(b),g=6366.707*Math.cos(e)*Math.sin(c),e=6366.707*Math.sin(e)*Math.sin(c),c=6366.707*Math.cos(c);return Math.sqrt((a-g)*(a-g)+(d-e)*(d-e)+(b-c)*(b-c))}
function OSGB36ToWGS84(){for(var a=new RefEll(6377563.396,6356256.909),b=a.maj,a=a.ecc,c=deg2rad(this.lat),d=deg2rad(this.lng),e=b/Math.sqrt(1-a*sinSquared(c)),b=(e+0)*Math.cos(c)*Math.cos(d),d=(e+0)*Math.cos(c)*Math.sin(d),a=((1-a)*e+0)*Math.sin(c),g=deg2rad(4.172222E-5),f=deg2rad(6.861111E-5),c=deg2rad(2.3391666E-4),e=446.448+b*0.9999795106+-g*d+f*a,c=-124.157+c*b+d*0.9999795106+-g*a,d=542.06+-f*b+g*d+a*0.9999795106,a=new RefEll(6378137,6356752.3141),b=a.maj,a=a.ecc,g=rad2deg(Math.atan(c/e)),c=
Math.sqrt(e*e+c*c),f=Math.atan(d/(c*(1-a))),h=1;h<10;h++)e=b/Math.sqrt(1-a*sinSquared(f)),f=phiN1=Math.atan((d+a*e*Math.sin(f))/c);this.lat=rad2deg(f);this.lng=g}
function WGS84ToOSGB36(){for(var a=new RefEll(6378137,6356752.3141),b=a.maj,a=a.ecc,c=deg2rad(this.lat),d=deg2rad(this.lng),e=b/Math.sqrt(1-a*sinSquared(c)),b=(e+0)*Math.cos(c)*Math.cos(d),d=(e+0)*Math.cos(c)*Math.sin(d),a=((1-a)*e+0)*Math.sin(c),g=deg2rad(-4.172222E-5),f=deg2rad(-6.861111E-5),c=deg2rad(-2.3391666E-4),e=-446.448+b*1.0000204894+-g*d+f*a,c=124.157+c*b+d*1.0000204894+-g*a,d=-542.06+-f*b+g*d+a*1.0000204894,a=new RefEll(6377563.396,6356256.909),b=a.maj,a=a.ecc,g=rad2deg(Math.atan(c/e)),
c=Math.sqrt(e*e+c*c),f=Math.atan(d/(c*(1-a))),h=1;h<10;h++)e=b/Math.sqrt(1-a*sinSquared(f)),f=phiN1=Math.atan((d+a*e*Math.sin(f))/c);this.lat=rad2deg(f);this.lng=g}
function OSRefToLatLng(){var a=new RefEll(6377563.396,6356256.909),b=deg2rad(49),c=deg2rad(-2),d=a.maj,e=a.min,g=a.ecc,f=0,a=0,a=this.easting,h=this.northing,j=(d-e)/(d+e),k=0,f=(h- -1E5)/(d*0.9996012717)+b;do k=e*0.9996012717*((1+j+1.25*j*j+1.25*j*j*j)*(f-b)-(3*j+3*j*j+2.625*j*j*j)*Math.sin(f-b)*Math.cos(f+b)+(1.875*j*j+1.875*j*j*j)*Math.sin(2*(f-b))*Math.cos(2*(f+b))-35/24*j*j*j*Math.sin(3*(f-b))*Math.cos(3*(f+b))),f+=(h- -1E5-k)/(d*0.9996012717);while(h- -1E5-k>=0.0010);b=d*0.9996012717*Math.pow(1-
g*sinSquared(f),-0.5);j=d*0.9996012717*(1-g)*Math.pow(1-g*sinSquared(f),-1.5);e=b/j-1;d=Math.tan(f)/(2*j*b);g=Math.tan(f)/(24*j*Math.pow(b,3))*(5+3*tanSquared(f)+e-9*tanSquared(f)*e);h=Math.tan(f)/(720*j*Math.pow(b,5))*(61+90*tanSquared(f)+45*tanSquared(f)*tanSquared(f));e=sec(f)/b;j=sec(f)/(6*b*b*b)*(b/j+2*tanSquared(f));k=sec(f)/(120*Math.pow(b,5))*(5+28*tanSquared(f)+24*tanSquared(f)*tanSquared(f));b=sec(f)/(5040*Math.pow(b,7))*(61+662*tanSquared(f)+1320*tanSquared(f)*tanSquared(f)+720*tanSquared(f)*
tanSquared(f)*tanSquared(f));f=f-d*Math.pow(a-4E5,2)+g*Math.pow(a-4E5,4)-h*Math.pow(a-4E5,6);a=c+e*(a-4E5)-j*Math.pow(a-4E5,3)+k*Math.pow(a-4E5,5)-b*Math.pow(a-4E5,7);return new LatLng(rad2deg(f),rad2deg(a))}
function LatLngToOSRef(){var a=new RefEll(6377563.396,6356256.909),b=deg2rad(49),c=deg2rad(-2),d=a.maj,e=a.min,g=a.ecc,f=deg2rad(this.lat),a=deg2rad(this.lng),h=0,j=0,h=(d-e)/(d+e),j=d*0.9996012717*Math.pow(1-g*sinSquared(f),-0.5),g=d*0.9996012717*(1-g)*Math.pow(1-g*sinSquared(f),-1.5),d=j/g-1,e=e*0.9996012717*((1+h+1.25*h*h+1.25*h*h*h)*(f-b)-(3*h+3*h*h+2.625*h*h*h)*Math.sin(f-b)*Math.cos(f+b)+(1.875*h*h+1.875*h*h*h)*Math.sin(2*(f-b))*Math.cos(2*(f+b))-35/24*h*h*h*Math.sin(3*(f-b))*Math.cos(3*(f+
b)))+-1E5,h=j/2*Math.sin(f)*Math.cos(f),k=j/24*Math.sin(f)*Math.pow(Math.cos(f),3)*(5-tanSquared(f)+9*d),n=j/720*Math.sin(f)*Math.pow(Math.cos(f),5)*(61-58*tanSquared(f)+Math.pow(Math.tan(f),4)),b=j*Math.cos(f),g=j/6*Math.pow(Math.cos(f),3)*(j/g-tanSquared(f)),f=j/120*Math.pow(Math.cos(f),5)*(5-18*tanSquared(f)+Math.pow(Math.tan(f),4)+14*d-58*tanSquared(f)*d),j=e+h*Math.pow(a-c,2)+k*Math.pow(a-c,4)+n*Math.pow(a-c,6),h=4E5+b*(a-c)+g*Math.pow(a-c,3)+f*Math.pow(a-c,5);return new OSRef(h,j)}
function UTMRefToLatLng(){var a=new RefEll(6378137,6356752.314),b=a.maj,c=a.ecc,a=c/(1-c),d=(1-Math.sqrt(1-c))/(1+Math.sqrt(1-c)),e=this.easting-5E5,g=this.northing,f=(this.lngZone-1)*6-180+3;ord(this.latZone)-ord("N")<0&&(g-=1E7);var g=g/0.9996/(b*(1-c/4-3*c*c/64-5*Math.pow(c,3)/256)),d=g+(3*d/2-27*Math.pow(d,3)/32)*Math.sin(2*g)+(21*d*d/16-55*Math.pow(d,4)/32)*Math.sin(4*g)+151*Math.pow(d,3)/96*Math.sin(6*g),h=b/Math.sqrt(1-c*Math.sin(d)*Math.sin(d)),g=Math.tan(d)*Math.tan(d),j=a*Math.cos(d)*Math.cos(d),
b=b*(1-c)/Math.pow(1-c*Math.sin(d)*Math.sin(d),1.5);e/=h*0.9996;b=(d-h*Math.tan(d)/b*(e*e/2-(5+3*g+10*j-4*j*j-9*a)*Math.pow(e,4)/24+(61+90*g+298*j+45*g*g-252*a-3*j*j)*Math.pow(e,6)/720))*(180/Math.PI);a=f+(e-(1+2*g+j)*Math.pow(e,3)/6+(5-2*j+28*g-3*j*j+8*a+24*g*g)*Math.pow(e,5)/120)/Math.cos(d)*(180/Math.PI);return new LatLng(b,a)}
function LatLngToUTMRef(a,b){var c=new RefEll(6378137,6356752.314),d=c.maj,e=c.ecc,g=this.lng,c=this.lat,f=c*(Math.PI/180),h=g*(Math.PI/180),j=Math.floor((g+180)/6)+1;c>=56&&c<64&&g>=3&&g<12&&(j=32);c>=72&&c<84&&(g>=0&&g<9?j=31:g>=9&&g<21?j=33:g>=21&&g<33?j=35:g>=33&&g<42&&(j=37));b!=null&&(j=b);var k=((j-1)*6-180+3)*(Math.PI/180),g=getUTMLatitudeZoneLetter(c);a!=null&&(g=a);var n=e/(1-e),o=d/Math.sqrt(1-e*Math.sin(f)*Math.sin(f)),l=Math.tan(f)*Math.tan(f),m=n*Math.cos(f)*Math.cos(f),h=Math.cos(f)*
(h-k),e=d*((1-e/4-3*e*e/64-5*e*e*e/256)*f-(3*e/8+3*e*e/32+45*e*e*e/1024)*Math.sin(2*f)+(15*e*e/256+45*e*e*e/1024)*Math.sin(4*f)-35*e*e*e/3072*Math.sin(6*f)),d=0.9996*o*(h+(1-l+m)*Math.pow(h,3)/6+(5-18*l+l*l+72*m-58*n)*Math.pow(h,5)/120)+5E5,f=0.9996*(e+o*Math.tan(f)*(h*h/2+(5-l+9*m+4*m*m)*Math.pow(h,4)/24+(61-58*l+l*l+600*m-330*n)*Math.pow(h,6)/720));c<0&&(f+=1E7);return new UTMRef(d,f,g,j)}
function getOSRefFromSixFigureReference(a){var b=a.substring(0,1),c=a.substring(1,2),d=parseInt(a.substring(2,5),10)*100,a=parseInt(a.substring(5,8),10)*100;b=="H"?a+=1E6:b=="N"?a+=5E5:b=="O"?(a+=5E5,d+=5E5):b=="T"&&(d+=5E5);b=ord(c);b>73&&b--;return new OSRef(d+(b-65)%5*1E5,a+(4-Math.floor((b-65)/5))*1E5)}
function getUTMLatitudeZoneLetter(a){return 84>=a&&a>=72?"X":72>a&&a>=64?"W":64>a&&a>=56?"V":56>a&&a>=48?"U":48>a&&a>=40?"T":40>a&&a>=32?"S":32>a&&a>=24?"R":24>a&&a>=16?"Q":16>a&&a>=8?"P":8>a&&a>=0?"N":0>a&&a>=-8?"M":-8>a&&a>=-16?"L":-16>a&&a>=-24?"K":-24>a&&a>=-32?"J":-32>a&&a>=-40?"H":-40>a&&a>=-48?"G":-48>a&&a>=-56?"F":-56>a&&a>=-64?"E":-64>a&&a>=-72?"D":-72>a&&a>=-80?"C":"Z"};var myKaMap=null,myKaNavigator=null,myKaQuery=null,myScalebar=null,queryParams=null,myKaRuler=null,objectClickable=!1,myKaRubberZoom=null,myKaTracker=null,initialized=!1,win1=null,eventz=null,utmzone=33,utmnzone="W",clientses=0,geopos,isOpera=_BrowserIdent_isOpera(),isIframe=!1,isMobile=!1,storage=null,myCoordinates=myOverlay=myInterval=null;function canUpdate(){return myOverlay.meta.updateuser!=null&&myOverlay.meta.updateuser=="true"}
function isAdmin(){return myOverlay.meta.adminuser!=null&&myOverlay.meta.adminuser=="true"}function getLogin(){return window.location.href.match(/.*\/sar_[0-9a-f]+/)?"-SAR-":/null/.test(myOverlay.meta.login)?null:myOverlay.meta.login}function myOnLoad_iframe(){isIframe=!0;startUp();var a=document.getElementById("refToggler");toggleReference(a)}function myOnLoad(){startUp()}function myOnLoad_mobile(){isMobile=!0;startUp();var a=document.getElementById("refToggler");toggleReference(a)}
function myOnLoad_droid(){isMobile=!0;document.addEventListener("deviceready",function(){navigator.network.connection.type==Connection.NONE&&(navigator.notification.vibrate(100),alert("OBS! Denne applikasjonen trenger internett!"));document.addEventListener("menubutton",function(a){return mainMenu(document.getElementById("toolbar"),a)},!1);startUp();var a=document.getElementById("refToggler");toggleReference(a)},!1)}
function startUp(){initDHTMLAPI();window.onresize=drawPage;myKaMap=new kaMap("viewport");myKaRuler=new myKaRuler(myKaMap);var a=getQueryParam("map"),b=getQueryParam("extents"),c=getQueryParam("cps");myKaQuery=new kaQuery(myKaMap,KAMAP_POINT_QUERY);myKaRubberZoom=new kaRubberZoom(myKaMap);myKaTracker=new kaMouseTracker(myKaMap);myKaTracker.activate();myKaNavigator=new kaNavigator(myKaMap);myKaNavigator.activate();myKaMap.registerForEvent(KAMAP_MAP_INITIALIZED,null,myMapInitialized);myKaMap.registerForEvent(KAMAP_INITIALIZED,
null,myInitialized);myKaMap.registerForEvent(KAMAP_SCALE_CHANGED,null,myScaleChanged);myKaMap.registerForEvent(KAMAP_EXTENTS_CHANGED,null,myExtentChanged);myKaMap.registerForEvent(KAMAP_LAYERS_CHANGED,null,myLayersChanged);myKaMap.registerForEvent(KAMAP_LAYER_STATUS_CHANGED,null,myLayersChanged);myKaMap.registerForEvent(KAMAP_QUERY,null,myQuery);myKaMap.registerForEvent(KAMAP_MAP_CLICKED,null,myMapClicked);myKaMap.registerForEvent(KAMAP_MOUSE_TRACKER,null,myMouseMoved);myKaMap.registerForEvent(KAMAP_MOVE_START,
null,function(){myOverlay!=null&&myOverlay.removePoint()});myScalebar=new ScaleBar(1);myScalebar.divisions=3;myScalebar.subdivisions=2;myScalebar.minWidth=150;myScalebar.maxWidth=250;myScalebar.place("scalebar");drawPage();myKaMap.initialize(a,b,c);geopos=document.getElementById("geoPosition");storage=window.localStorage;storage==null&&(storage={getItem:function(){return null},removeItem:function(){return null},setItem:function(){return null}});ses_storage=window.sessionStorage;ses_storage==null&&
(ses_storage={getItem:function(){return null},removeItem:function(){return null},setItem:function(){return null}})}var permalink=!1,args=null;
function myMapInitialized(){var a=a=window.location.href,a=a.substring(a.indexOf("?")+1,a.length);args={};for(var b=a.split("&"),c=0;c<b.length;c++){var d=b[c].indexOf("=");if(d!=-1){var e=b[c].substring(0,d),d=b[c].substring(d+1);args[e]=unescape(d)}}permalink=a.length>=2&&a.match(/^zoom\=.*/);permalink||(a=storage["polaric.baselayer"],a!=null&&myKaMap.setBaseLayer(a))}
function myInitialized(){var a=null;a==null&&(a=args.view);a==null&&(a=defaultView);if(!permalink){var b=storage["polaric.extents.0"],c=storage["polaric.extents.1"],d=storage["polaric.extents.2"],e=storage["polaric.extents.3"];b!=null?(myKaMap.zoomToExtents(parseInt(b,10),parseInt(c,10),parseInt(d,10),parseInt(e,10)),myKaMap.selectMap(a,!0)):myKaMap.selectMap(a,!1)}c=myKaMap.getMaps();if(d=document.forms[0].maps){var b=0,g;for(g in c)d[b++]=new Option(c[g].title,c[g].name,!1,!1);if(d.options[d.selectedIndex].value!=
a)for(g=0;g<d.options.length;g++)if(d.options[g].value==a){d.options[g].selected=!0;break}}myOverlay==null&&(myOverlay=new kaXmlOverlay(myKaMap,1200));a=storage["polaric.filter"];a==null&&(a=args.filter);a==null&&(a=defaultFilterView);var f=document.forms[0].filters;if(f){c=b=0;for(g in filterViews)a!=null&a==filterViews[g].name&&(c=g,filterView(a)),f[b++]=new Option(filterViews[g].title,filterViews[g].name,!1,!1);f.onchange=function(){filterView(f[f.selectedIndex].value)};f[c].selected=!0}args.findcall!=
null&&findStation(args.findcall,!1);switchMode("toolPan");myKaMap.domObj.onmousedown=menuMouseSelect;if(!isIframe&&!isMobile)buttonMenu=document.getElementById("buttonMenu"),buttonMenu.onclick=function(a){return mainMenu(buttonMenu,a)},buttonMenu.oncontextmenu=function(a){return mainMenu(buttonMenu,a)};document.getElementById("viewport").oncontextmenu=function(a){document.kaCurrentTool!=myKaRuler&&showContextMenu(null,a);a.cancelBubble=!0};ie?(document.getElementById("viewport").onclick=function(){document.kaCurrentTool!=
myKaQuery&&menuMouseSelect()},document.getElementById("toolbar").onclick=function(){document.kaCurrentTool!=myKaQuery&&menuMouseSelect()}):(document.getElementById("viewport").onmouseup=function(){isMenu&&menuMouseSelect()},document.getElementById("toolbar").onmouseup=function(){isMenu&&menuMouseSelect()});initialized=!0;!isIframe&&!isMobile&&!ses_storage["polaric.welcomed"]&&(ses_storage["polaric.welcomed"]=!0,setTimeout(function(){welcome()},2E3))}
function welcome(){remotepopupwindowCSS(myKaMap.domObj,"welcome.html",1,1,"welcome")}function extentQuery(){var a=myKaMap.getGeoExtents(),b="";selectedFView!=null&&(b="&filter="+selectedFView);return"x1="+Math.round(a[0])+"&x2="+Math.round(a[1])+"&x3="+Math.round(a[2])+"&x4="+Math.round(a[3])+b}var xmlSeqno=0,retry=0;
function getXmlData(a){xmlSeqno++;var b=server_url+(getLogin()?"srv/sec-mapdata?":"srv/mapdata?"),c=myOverlay.loadXml(b+extentQuery()+"&scale="+currentScale+(a?"&wait=true":"")+(clientses!=null?"&clientses="+clientses:"")),d=xmlSeqno;a&&setTimeout(function(){xmlSeqno==d&&(retry++,retry>=2?(OpenLayers.Console.warn("XML Call Timeout. Max retry cnt reached. RELOAD"),window.location.reload()):(OpenLayers.Console.warn("XML Call Timeout. Abort and retry"),abortCall(c),getXmlData(!1)))},15E4)}
function postLoadXml(){retry=0;if(myOverlay.meta.utmzone!=null)utmzone=myOverlay.meta.utmzone;if(myOverlay.meta.utmnzone!=null)utmnzone=myOverlay.meta.utmnzone;if(myOverlay.meta.clientses!=null)clientses=myOverlay.meta.clientses;document.getElementById("sarmode").style.visibility=myOverlay.meta.sarmode!=null&&myOverlay.meta.sarmode=="true"?"visible":"hidden";if(!isIframe&&getLogin()!=null)ldiv=document.getElementById("login"),ldiv.innerHTML=getLogin(),ldiv.className="login";getXmlData(!0)}
var selectedFView=defaultFilterView;function filterView(a){selectedFView=a;initialized&&(storage["polaric.filter"]=a,myOverlay.removePoint(),getXmlData(!1))}var currentScale=-1;function myScaleChanged(a,b){currentScale=b=Math.round(b);myScalebar.update(b);b>=1E6&&(b/=1E6,b+=" Million");var c;getRawObject("scale").innerHTML="current scale 1 : "+b}var prev_extents=null;
function myExtentChanged(a,b){if(prev_extents==null||Math.round(b[0])!=Math.round(prev_extents[0])||Math.round(b[1])!=Math.round(prev_extents[1])||Math.round(b[2])!=Math.round(prev_extents[2])||Math.round(b[3])!=Math.round(prev_extents[3]))OpenLayers.Console.info("EXTENTS CHANGED: ",b),initialized&&(storage.removeItem("polaric.extents.0"),storage.removeItem("polaric.extents.1"),storage.removeItem("polaric.extents.2"),storage.removeItem("polaric.extents.3"),storage.removeItem("polaric.baselayer"),
storage["polaric.extents.0"]=Math.round(b[0]).toString(),storage["polaric.extents.1"]=Math.round(b[1]).toString(),storage["polaric.extents.2"]=Math.round(b[2]).toString(),storage["polaric.extents.3"]=Math.round(b[3]).toString(),storage["polaric.baselayer"]=myKaMap.getBaseLayer()),initialized?(getXmlData(!1),myKaMap.updateObjects()):setTimeout(function(){getXmlData(!1)},2E3),prev_extents=b;myKaRuler.reset()}function myLayersChanged(){updateLinkToView()}
function myQuery(a,b,c){menuMouseSelect()&&showPosInfo(c);return!1}function myMapClicked(){return!0}function myMouseMoved(a,b){var c=(new UTMRef(b.x,b.y,this.utmnzone,this.utmzone)).toLatLng();geopos.innerHTML="&nbsp; "+c.toUTMRef()+"<br>"+ll2Maidenhead(c.lat,c.lng)}
function myObjectClicked(a,b,c,d){var b=b?b:event?event:null,e=b.pageX?b.pageX:b.clientX,g=b.pageY?b.pageY:b.clientY;menuMouseSelect();c?setTimeout(function(){/^(p|P):.*/.test(c)?popupwindow(myKaMap.domObj,"<h1>"+d+'</h1><img src="'+c.substring(2)+'">',e,g,null,"obj_click",!0):window.location=c},100):showStationInfo(a,!1,e,g);b.cancelBubble=!0;return!1}
function myTrailClicked(a,b){var b=b?b:event?event:null,c=b.pageX?b.pageX:b.clientX,d=b.pageY?b.pageY:b.clientY;menuMouseSelect();ie?remotepopupwindow(myKaMap.domObj,server_url+"srv/trailpoint?id="+a+"&index="+b.srcElement._index,c,d):remotepopupwindow(myKaMap.domObj,server_url+"srv/trailpoint?id="+a+"&index="+b.target._index,c,d);b.cancelBubble=!0;b.stopPropagation&&b.stopPropagation();return!1}
function histList_hover(a,b){var c=document.getElementById(a+"_"+b+"_trail");c!=null&&c.setAttribute("class","trailPoint_hover")}function histList_hout(a,b){var c=document.getElementById(a+"_"+b+"_trail");c!=null&&c.setAttribute("class","trailPoint")}function parsePosPix(a){a=a.substr(0,a.length()-2);return safeParseInt(a)}
function histList_click(a,b){function c(a){a=a.substr(0,a.length-2);return safeParseInt(a)}var d=document.getElementById(a+"_"+b+"_trail");menuMouseSelect();d.setAttribute("class","trailPoint");var e=d.parentNode,g=c(d.style.left)+c(e.style.left)+c(e.parentNode.style.left)+10,d=c(d.style.top)+c(e.style.top)+c(e.parentNode.style.top)+10;remotepopupwindow(myKaMap.domObj,server_url+"srv/trailpoint?id="+a+"&index="+b,g,d)}
function myZoomToGeo(a,b){var c=myKaMap.getGeoExtents(),d=(c[2]+c[0])/2,c=(c[3]+c[1])/2;(a<d-50||a>d+50||b<c-30||b>c+30)&&myKaMap.zoomTo(a,b)}function myZoomTo(a,b){var c=myKaMap.pixToGeo(a,b-5);myZoomToGeo(c[0],c[1])}function ll2Maidenhead(a,b){var c=b+180,d=chr(65+Math.floor(c/20)),e=a+90,g=chr(65+Math.floor(e/10)),c=chr(48+Math.floor(c%20/2)),e=chr(48+Math.floor(e%10)),f=chr(97+Math.floor((b+180)%2*12)),h=chr(97+Math.floor((a+90)%1*24));return d+g+c+e+f+h}
function parseQueryString(){queryParams={};var a=window.location.search;if(a!="")for(var a=a.substring(1),a=a.split("&"),b=0;b<a.length;b++){var c=a[b].split("=");queryParams[c[0]]=c[1]}}function getQueryParam(a){queryParams||parseQueryString();return queryParams[a]?queryParams[a]:""}function mySetMap(a){window.storage["polaric.view"]=a;myKaMap.selectMap(a)}
function toggleToolbar(a){if(a.style.backgroundImage=="")a.isOpen=!0;if(a.isOpen){a.title="show toolbar";a.style.backgroundImage="url("+server_url+"KaMap/images/arrow_down.png)";getObjectTop(a);var b=getObject("toolbar");b.display="none";a.isOpen=!1;a.style.top="3px"}else a.title="hide toolbar",a.style.backgroundImage="url("+server_url+"KaMap/images/arrow_up.png)",b=getObject("toolbar"),b.display="block",a.isOpen=!0,b=getObjectHeight("toolbar"),a.style.top=b+3+"px"}
function toggleReference(a){if(a.style.backgroundImage=="")a.isOpen=!0;if(a.isOpen){a.title="show reference";a.style.backgroundImage="url("+server_url+"KaMap/images/arrow_up.png)";var b=getObject("reference");b.display="none";a.isOpen=!1;a.style.bottom="3px"}else a.title="hide reference",a.style.backgroundImage="url("+server_url+"KaMap/images/arrow_down.png)",b=getObject("reference"),b.display="block",a.isOpen=!0,a.style.bottom=getObjectHeight("reference")+3+"px"}
function dialogToggle(a,b){var c=getObject(b);c.display=="none"?(c.display="block",a.childNodes[0].src=server_url+"KaMap/images/dialog_shut.png"):(c.display="none",a.childNodes[0].src=server_url+"KaMap/images/dialog_open.png")}function drawPage(){var a=getInsideWindowWidth(),b=getInsideWindowHeight(),c=getRawObject("viewport");c.style.width=myKaMap.isIE4?a-2+"px":a+"px";c.style.height=myKaMap.isIE4?b-2+"px":b+"px";myKaMap.resize()}
function getFullExtent(){myKaMap.getCurrentMap();var a=myKaMap.getCurrentMap().defaultExtents;myKaMap.zoomToExtents(a[0],a[1],a[2],a[3])}
function switchMode(a){if(!isIframe&&!isMobile&&a=="toolRuler")myKaRuler.activate(),objectClickable=!1,getRawObject("toolRuler").style.backgroundImage="url("+server_url+"KaMap/images/icon_set_nomad/ruler2.gif)",getRawObject("toolQuery").style.backgroundImage="url("+server_url+"KaMap/images/icon_set_nomad/tool_query_1.png)",getRawObject("toolPan").style.backgroundImage="url("+server_url+"KaMap/images/icon_set_nomad/tool_pan_1.png)",getRawObject("toolZoomRubber").style.backgroundImage="url("+server_url+
"KaMap/images/icon_set_nomad/tool_rubberzoom_1.png)";else if(a=="toolQuery"){myKaQuery.activate();objectClickable=!0;if(!isIframe&&!isMobile)getRawObject("toolRuler").style.backgroundImage="url("+server_url+"KaMap/images/icon_set_nomad/ruler1.gif)";getRawObject("toolQuery").style.backgroundImage="url("+server_url+"KaMap/images/icon_set_nomad/tool_query_2.png)";getRawObject("toolPan").style.backgroundImage="url("+server_url+"KaMap/images/icon_set_nomad/tool_pan_1.png)";getRawObject("toolZoomRubber").style.backgroundImage=
"url("+server_url+"KaMap/images/icon_set_nomad/tool_rubberzoom_1.png)"}else if(a=="toolPan"){myKaNavigator.activate();objectClickable=!0;if(!isIframe&&!isMobile)getRawObject("toolRuler").style.backgroundImage="url("+server_url+"KaMap/images/icon_set_nomad/ruler1.gif)";getRawObject("toolQuery").style.backgroundImage="url("+server_url+"KaMap/images/icon_set_nomad/tool_query_1.png)";getRawObject("toolPan").style.backgroundImage="url("+server_url+"KaMap/images/icon_set_nomad/tool_pan_2.png)";getRawObject("toolZoomRubber").style.backgroundImage=
"url("+server_url+"KaMap/images/icon_set_nomad/tool_rubberzoom_1.png)"}else if(a=="toolZoomRubber"){myKaRubberZoom.activate();objectClickable=!1;if(!isIframe&&!isMobile)getRawObject("toolRuler").style.backgroundImage="url("+server_url+"KaMap/images/icon_set_nomad/ruler1.gif)";getRawObject("toolQuery").style.backgroundImage="url("+server_url+"KaMap/images/icon_set_nomad/tool_query_1.png)";getRawObject("toolPan").style.backgroundImage="url("+server_url+"KaMap/images/icon_set_nomad/tool_pan_1.png)";
getRawObject("toolZoomRubber").style.backgroundImage="url("+server_url+"KaMap/images/icon_set_nomad/tool_rubberzoom_2.png)"}else myKaNavigator.activate(),objectClickable=!0}function applyPNGFilter(a){var b=server_url+"KaMap/images/a_pixel.gif";if(a.src!=b){var c=a.src;a.src=b;a.runtimeStyle.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+c+"',sizingMethod='scale')"}}function WOFocusWin(){eval("if( this."+name+") this."+name+".moveTo(50,50); this."+name+".focus();")}
function WOOpenWin(a,b,c){eval("this."+a+"=window.open('"+b+"','"+a+"','"+c+"');")}function WinOpener(){this.openWin=WOOpenWin;this.focusWin=WOFocusWin};