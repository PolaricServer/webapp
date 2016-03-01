<?php
  if (!isset($_SERVER['PHP_AUTH_USER'])) {
    header('WWW-Authenticate: Basic realm="sporingstjeneste"');
    header('HTTP/1.0 401 Unauthorized');
  }
?> 

<html>
  <head>
    <title>aprs.no login</title> 
    <meta http-equiv="REFRESH" content="1; URL=.?debug=true">
  </head>
  <body style="background: #A1C1C9">
  <img src="images/nrrl.gif" style="float:left; padding-right:10px;">
  <h1>NRRL Sporingstjeneste</h1>
  
<?php
  if (!isset($_SERVER['PHP_AUTH_USER'])) {
    echo "Sorry, login failed...";
    setcookie("polaric.tryLogin", "", time()-3600);
  } else {
    echo "<p>You are logged in as '{$_SERVER['PHP_AUTH_USER']}'.</p>";
    setcookie("polaric.tryLogin", "true", time()+3600);
  }
?> 
  
  </body>
</html>
