<?php
  if (!isset($_SERVER['PHP_AUTH_USER'])) {
    header('WWW-Authenticate: Basic realm="sporingstjeneste"');
    header('HTTP/1.0 401 Unauthorized');
  }
?> 

<html>
  <head>
    <title>aprs.no login</title> 
    <meta http-equiv="REFRESH" content="3; URL=.">
  </head>
  <body style="background: #A1C1C9">
  <img src="images/nrrl.gif" style="float:left; padding-right:10px;">
  <h1>NRRL Sporingstjeneste</h1>
  
<?php
  if (!isset($_SERVER['PHP_AUTH_USER'])) {
    echo "Sorry, login failed...";
    setcookie("polaric.tryLogin", "", time()-3600);
  } else {
    echo "<p>You are logged in as <b>'{$_SERVER['PHP_AUTH_USER']}'</b>";
    echo " &nbsp;(valid for 12 hours).</p>"; 
    setcookie("polaric.tryLogin", "true", time()+43200);
  }
?> 
  
  </body>
</html>
