 
 
var sar_key = null;
var _tryAuth = false; 
 
 
function setTryAuth() {
   _tryAuth = true;
}



/* Return true if we are going to try to log in and not logged in already */
function tryAuth() {
   _tryAuth = (Cookies.get("polaric.tryLogin") == 'true'); 
   if (_tryAuth) {
      /* Autologout when cookie expires */
      setInterval(function() { 
        if ( Cookies.get("polaric.tryLogin") != 'true') 
           logout();
      }, 600000);
   }
   
   return _tryAuth || getLogin(); 
}




/* Next time tryAuth is called it will return false if we don't know we are logged in. 
 * Next time failedAuth is called it will return true 
 */
function failAuth() {
   _tryAuth = false; 
   document.cookie = 'polaric.tryLogin' + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;';
}




/* Return true if we have have called failAuth */
function failedAuth() {
  return !_tryAuth; 
}

 
 /* Permissions */
 
 /* Return true if logged in user */  
 function isLoggedIn() { 
     return (myOverlay.meta.loginuser != null && myOverlay.meta.loginuser == 'true'); 
 }
 
 
 /* Return true if logged in user is allowed to update information */
 function canUpdate() { 
     return (isLoggedIn() && myOverlay.meta.updateuser != null && myOverlay.meta.updateuser == 'true'); 
 }
 
 
 /* Return true if logged in user is a super user */  
 function isAdmin() { 
     return (isLoggedIn() && myOverlay.meta.adminuser != null && myOverlay.meta.adminuser == 'true'); 
 }
 
 
 /* get login name */
 function getLogin()
 { 
   if (sar_key != null || window.location.href.match(/.*\/sar_[0-9a-f]+/))
     return "-SAR-";
   if (/null/.test(myOverlay.meta.login)) 
     return null;   
   return myOverlay.meta.login; 
 }
 
 
 function show_SAR_access(a)
 {
   var sdiv = document.getElementById('sarmode');
   if (sdiv != null)
     sdiv.innerHTML = (a ? '<img src="images/sar-o.png">' : '<img src="images/sar.png">');
 }
 
 
 /**************************************************************************************
  * setSarKey - Store SAR key
  *    k key value (string)
  * 
  * Note that if this is unsuccessfully used to authenticate to server, it is
  * removed from local storage.  
  **************************************************************************************/
 
 function setSarKey(k)
 { 
   sar_key = k;
   storage.removeItem('polaric.sarkey');
   storage['polaric.sarkey'] = k;
 }
 
 
 function removeSarKey()
 {     
    sar_key = null;
    storage.removeItem('polaric.sarkey');
 }
 
 
 
 function logout() {
   // "Dirty hack" from http://tuhrig.de/basic-auth-log-out-with-javascript/
   if (!isLoggedIn())
     return; 

   jQuery.ajax({
     type: "GET",
     url: "/login.php",
     async: false,
     username: "logmeout",
     password: "---",
     headers: { "Authorization": "Basic xxx" }
   })
   .done(function(){
     // If we don't get an error, we actually got an error as we expect an 401!
   })
   .fail(function(){
     // We expect to get an 401 Unauthorized error! In this case we are successfully 
     // logged out and we redirect the user.
     window.location = "";
   });
 }
 
 
 
 
 
 
 