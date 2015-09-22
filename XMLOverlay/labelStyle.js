
var labelStyle = null; 

function init_labelStyle(storage, uid)
{ labelStyle = new LabelStyle(storage, uid); }



function LabelStyle (storage, uid)
{
   this.currentIndex = 0; 
   this.start = 5;
   this.styles = ["40%", "50%", "60%", "70%", "80%", "90%", "100%", "110%", "120%", "130%", "140%", "150%"];
   this.uid = uid;
   this.storage = storage;
   var x = parseInt(storage[uid+".labelStyle"]);
   if (x) this.currentIndex = x; 
}


LabelStyle.prototype.setFontForClass = function(idx, cl)
{
  var elements = getElementsByClassName(document, cl);
  for (var i = 0; i < elements.length; i++) 
    elements[i].style.fontSize = this.styles[idx];                
}


LabelStyle.prototype.setFont = function ()
{
  this.storage[this.uid+".labelStyle"] = this.currentIndex;
  var idx = this.currentIndex + this.start;
  this.setFontForClass(idx, 'lstill');
  this.setFontForClass(idx, 'lobject');
  this.setFontForClass(idx, 'lmoving');
}


LabelStyle.prototype.next = function ()
{
    if (this.currentIndex < this.styles.length-this.start-1) {
        this.currentIndex++;
        this.setFont()
    } 
}


LabelStyle.prototype.previous = function ()
{
    if (this.currentIndex > 0-this.start) {
       this.currentIndex--;
       this.setFont()
    }
}



LabelStyle.prototype.getFontSize = function ()
{
   return this.styles[this.currentIndex + this.start];
}




/* To support older browsers that haven't implemented getElementsByClassName */

function getElementsByClassName(node,classname) {
  if (node.getElementsByClassName) { // use native implementation if available
    return node.getElementsByClassName(classname);
  } else {
    return (function getElementsByClass(searchClass,node) {
      if ( node == null )
        node = document;
      var classElements = [],
      els = node.getElementsByTagName("*"),
            elsLen = els.length,
            pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)"), i, j;
            
            for (i = 0, j = 0; i < elsLen; i++) {
              if ( pattern.test(els[i].className) ) {
                classElements[j] = els[i];
                j++;
              }
            }
            return classElements;
    })(classname, node);
  }
}
