<?php
  if (!isset($_SERVER['PHP_AUTH_USER'])) {
    header('WWW-Authenticate: Basic realm="sporingstjeneste"');
    header('HTTP/1.0 401 Unauthorized');
  }
?> 

<html>
  <head>
    <title>aprs.no login</title> 
    <meta http-equiv="REFRESH" content="1; URL=.">
  </head>
  <body style="background: #A1C1C9">
  <img src="images/nrrl.gif" style="float:left; padding-right:10px;">
  <h1>NRRL Sporingstjeneste</h1>
  
<?php
  if (!isset($_SERVER['PHP_AUTH_USER'])) {
    echo 'Beklager, du kunne ikke logge inn...';
  } else {
    echo "<p>Du er logget inn som '{$_SERVER['PHP_AUTH_USER']}'.</p>";
  }
?> 
  
  </body>
</html>
