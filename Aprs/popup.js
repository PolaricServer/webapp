

var ie  = document.all
var ns6 = document.getElementById&&!document.all

var allowedPopups = 1;
var isMenu        = false ;
var activepopup   = null; 
var psubdiv       = null;
var myScroll      = null;

function menuMouseSelect()
{
    if( allowedPopups <= 0 ) { 
        removePopup();
        if (myScroll != null) 
             myScroll.destroy();
        myScroll = null; 
        return false; 
    }
    return true;
}


function _executeItem(elem, actn)
{
    removePopup();
    actn();
}



function _createItem(text, actn)
{
    var elem = document.createElement('div');
    elem.origCls = '';
    elem.onmouseup   = function(e) { _executeItem(elem, actn); }
    elem.onmousedown = function(e) { _executeItem(elem, actn); }  
    elem.onmouseover = function(e) { elem.origCls = elem.className; 
                                     elem.className += ' ITEM_hover'; }
    elem.onmouseout  = function(e) { elem.className = elem.origCls;}
    
    elem.appendChild(document.createTextNode(text));
    return elem;
}




function _createMenu(mnu, title) 
{  
    var menudiv = document.createElement('div');
    var item = null;
    menudiv.style.display = 'none';
    menudiv.className = 'POPUPMENU';  
    
    for (i in mnu) {
        if (mnu[i] == null) 
            item.className = 'ITEM_sep';
        else {
           var atxt  = (mnu[i][0] == null ? '' : mnu[i][0]);
           var alink = (mnu[i][1] == null ? '' : mnu[i][1]);
           item = _createItem(atxt, alink); 
           menudiv.appendChild(item);
        }
    } 
    item.className = 'ITEM_last';
    return menudiv; 
}



function removePopup()
{
    if (activepopup == null)
       return;
    isMenu = false;
    allowedPopups++;
    activepopup.style.display = "none" ;
    activepopup.parentNode.removeChild(activepopup);
}



function popupmenu(onDiv, txt, tit, x, y)
{
    isMenu = true;
    popup(onDiv, _createMenu(txt, tit), x, y, false);  
}



function popupwindow(onDiv, ihtml, x, y, img, id, delay)
{
    var pdiv = document.createElement('div');
    pdiv.className = 'POPUP'; 
    pdiv.innerHTML = ihtml;
    if (id != null) pdiv.id = id;
    if (delay) 
        setTimeout( function() {
          popup(onDiv, pdiv, x, y, img);
        }, 700);
    else 
      popup(onDiv, pdiv, x, y, img);
    
    pdiv.onmousedown = function(e) 
       { e = (e)?e:((event)?event:null); e.cancelBubble = true; return null; };
    pdiv.onmouseup = function(e) 
       { e = (e)?e:((event)?event:null); e.cancelBubble = true; return null; };
    pdiv.onclick = function(e)   
       { e = (e)?e:((event)?event:null); e.cancelBubble = true; return null; };
    pdiv.onmousemove = function(e)
       { e = (e)?e:((event)?event:null); e.cancelBubble = true; return null; };
   return pdiv;
}



function remotepopupwindow(onDiv, url, x, y, id)
{
    call(url, null, function(txt) { popupwindow(onDiv, txt, x, y, false, id, false); } );
}



function remotepopupwindowCSS(onDiv, url, x, y, css)
{
   call(url, null, function(txt) 
   { var div = popupwindow(onDiv, txt, 1, 1, false, null, false); 
     if (css != null) 
          div.className = css;
   } );
}

  
   
   

function popup(onDiv, menudiv, x, y, img)
{
     if (allowedPopups <= 0)
         return;
           
     var image;
     psubdiv = activepopup = menudiv;  
     if (img != null && img) {
         image = document.createElement('img');
         activepopup.appendChild(image);
      	 image.src='images/cross.gif';
	 image.style.position='absolute';
	 image.style.left= -9+'px';
         image.style.top= -12+'px';
         image.style.zIndex = 1001;
         activepopup = document.createElement('div');
         activepopup.appendChild(psubdiv);
         activepopup.onclick = function(e) 
            {psubdiv.style.display = 'none';}; 
     }
     
     onDiv.appendChild(activepopup);
     var xoff=0;
     var yoff=0;
     
  
     activepopup.style.position   = 'absolute';
     activepopup.style.display    = 'block';
     activepopup.style.padding    = '2px';
     activepopup.style.cursor     = 'default';

     if (menudiv.clientHeight+10 > document.body.clientHeight) {
         activepopup.style.maxHeight = document.body.clientHeight-5 + "px";
         menudiv.id = 'wrapper';
         
         /* EXPERIMENTAL: Activate scroller */
         if (isMobile) 
            setTimeout(function () {
              myScroll = new iScroll('wrapper');
            }, 1000);
         else
           activepopup.style.overflowY  = 'scroll';
     }
     else
       activepopup.style.overflowY = 'visible';
     
     xoff = x + 10 + menudiv.clientWidth - document.body.clientWidth;
     if (xoff > 0) {
        x -= xoff;
        if (image!=null)
           image.style.left =(xoff-9)+'px';
     }
     yoff = y + 5 + menudiv.clientHeight - document.body.clientHeight;
     if (yoff > 0) {
        y -= yoff;
        if (image!=null)
           image.style.top =(yoff-12)+'px';
     }
     activepopup.style.left    = x+"px";
     activepopup.style.top     = y+"px";
     activepopup.style.zIndex  = 1000;

     
     /* Workaround to prevent OL from reacting on mousemove as long as popup is active */
     if (!ie) {
       var evObj = document.createEvent('MouseEvents');
       evObj.initMouseEvent( 'mouseup', true, true, window, x, y, x, y, 220, false, false, true, false, 0, null );
       onDiv.dispatchEvent(evObj);
     }
     allowedPopups--;


}

