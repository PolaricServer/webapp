

/******************** Ring buffer for messages *****************/

function MessageBuffer(size) {
  this.messages = new Array();
  this.msgs_index = 0;
  this.msgs_cnt = 0;
  this.msgs_current = 0;
  this.MAX = size;
}

MessageBuffer.prototype.putMessage = function(m) {
  var t = this;
  if (t.msgs_cnt==t.MAX)
    t.msgs_index = (t.msgs_index + 1) % t.MAX;
  else
    t.msgs_cnt++;
  
  var i = (t.msgs_index + t.msgs_cnt) % t.MAX; 
  t.messages[i] = m; 
  t.msgs_current = i;
}

MessageBuffer.prototype.getMessage = function(i) 
  { return this.messages[i]; }

MessageBuffer.prototype.lastIndex = function() 
  { return this.msgs_index + this.msgs_cnt; }

MessageBuffer.prototype.currIndex = function()
  { return this.msgs_current; }

MessageBuffer.prototype.hasOlder = function()  
  { return (this.msgs_cnt > 1 && this.msgs_current != (this.msgs_index + 1) % this.MAX); }

MessageBuffer.prototype.hasNewer = function() 
  { return (this.msgs_cnt > 1 && this.msgs_current != (this.msgs_index + this.msgs_cnt) % this.MAX) }

MessageBuffer.prototype.incrementIndex = function() 
{ if (this.hasNewer()) this.msgs_current = (this.msgs_current + 1) % this.MAX; 
  return this.msgs_current;
}

MessageBuffer.prototype.decrementIndex = function() { 
  if (this.hasOlder()) { 
     this.msgs_current--; 
     if (this.msgs_current < 0) this.msgs_current += this.MAX;
  }
  return this.msgs_current;
}



/*********** Websocket handler ********************************/

var msgbuf = new MessageBuffer(10);
var msg_websock = null;

function message_init() {
   var loc = server_loc, uri;
   uri =  (loc.protocol === "https:") ? "wss" : "ws";
   uri += "://" + loc.host + loc.pathname;
   uri += "ws/messages";
   msg_websock = new WebSocket(uri);
  
   
  msg_websock.onopen = function() { 
     OpenLayers.Console.info("Connected to server (for messaging).");
  };
  
  msg_websock.onmessage = function(evt) { 
     var msg = JSON.parse(evt.data);
     msgbuf.putMessage(msg);
     popup_showMessage(msgbuf.currIndex());
  };
  
  
  msg_websock.onclose = function(evt) {
    /* If connection is closed, we probably need to log in again anyway */
  }
  
  
  msg_websock.onerror = function(evt) { 
     OpenLayers.Console.info("Failed to connect to server (for messaging).");
  };
}



function message_close() {
  if (msg_websock && msg_websock != null) 
      msg_websock.close();
}


function message_send(msg) {
  msg_websock.send(JSON.stringify(msg));
}




Date.prototype.toLocaleFormat = Date.prototype.toLocaleFormat || function(pattern) {
  return pattern.replace(/%Y/g, this.getFullYear()).replace(/%m/g, (this.getMonth() + 1)).replace(/%d/g, this.getDate())
        .replace(/%H/g, this.getHours()).replace(/%M/g, this.getMinutes());
};



/************* UI: Popups ****************************/


function popup_showMessage(i) 
{
   var xpos = 50; 
   var ypos = 70;
   removePopup();
   var m = msgbuf.getMessage(i);
   var pdiv = popupwindow(document.getElementById("anchor"), 
           '<div><h1>' +_('Incoming message')+'</h1>' +
             '<div id="messageform"><form> ' +
               '<span class="sleftlab">From:</span>' + m.from + '<br/>' +
               '<span class="sleftlab">To:</span>'   + m.to+ '<br/>' +
               '<span class="sleftlab">Time:</span>'  + new Date(m.time).toLocaleFormat('%H:%M') + '<br/>' + 
               '<div id="msgtext">' + m.text + '</div>' +
                  buttns() + 
             '</form></div>'+
           '</div>', xpos, ypos, null); 

   $('#obutton').click( function(e) {
     e = (e)?e:((event)?event:null);
     e.cancelBubble = true; 
     if (e.stopPropagation) e.stopPropagation();
     popup_showMessage( msgbuf.decrementIndex() );                 
   });
   
   $('#nbutton').click( function(e) {
     e = (e)?e:((event)?event:null);
     e.cancelBubble = true; 
     if (e.stopPropagation) e.stopPropagation();
     popup_showMessage( msgbuf.incrementIndex() )                 
   });
   
   
   function buttns() {
     var older = (msgbuf.hasOlder() ? '<button id="obutton"><img src="images/back.png"></img></button>' : '');
     var newer = (msgbuf.hasNewer() ? '<button id="nbutton"><img src="images/fwd.png"></img></button>' : '');
     return older+newer; 
   }
  
}




function popup_sendMessage()
{
  fullPopupWindow('Message', server_url + 'srv/sendmsg'+ '?lang='+language , 390, 220);
}

