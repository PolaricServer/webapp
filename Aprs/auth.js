 
 
var sar_key = null;

 
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
 
 

 
 
 
 
 
 
