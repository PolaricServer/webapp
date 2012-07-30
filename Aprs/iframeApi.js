var polaric = null;

function init_polaric(iframeid, serverdomain)
{ polaric = new polaricApi(iframeid, serverdomain); }

function polaricApi(iframeid, serverdomain) {
   this.domain = serverdomain;
   this.frame = document.getElementById(iframeid).contentWindow; 
}

polaricApi.prototype.zoomIn = function()
  { this.frame.postMessage("zoomIn", this.domain); }

polaricApi.prototype.zoomOut = function()
  { this.frame.postMessage("zoomOut", this.domain);}
  
polaricApi.prototype.zoomScale = function(scale)
  { this.frame.postMessage("zoomScale#"+scale, this.domain);}
  
polaricApi.prototype.gotoUtm = function(zone, easting, northing)
  { this.frame.postMessage("gotoUtm#"+zone+"#"+easting+"#"+northing, this.domain);}

polaricApi.prototype.findItem = function(ident)
  { this.frame.postMessage("findItem#"+ident, this.domain); }

polaricApi.prototype.selectMap = function(ident)
  { this.frame.postMessage("selectMap#"+ident, this.domain); }
  
polaricApi.prototype.selectBaseLayer = function(ident)
  { this.frame.postMessage("selectBaseLayer#"+ident, this.domain); }  