<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">

<?php 
$isMobile = false; 
$isIframe = false; 
$isDebug = false;

// Try to detect if mobile browser or app is in to be used in an iframe
$useragent=$_SERVER['HTTP_USER_AGENT'];
if((isset($_GET['mobile']) &&  preg_match('/true|TRUE/i', $_GET['mobile'])) || 
   preg_match('/android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i',$useragent)||preg_match('/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i',substr($useragent,0,4)))
  $isMobile = true;
  
if ((isset($_GET['iframe']) && preg_match('/true|TRUE/i', $_GET['iframe'])))
  $isIframe = true;
  
if ((isset($_GET['debug']) && preg_match('/true|TRUE/i', $_GET['debug'])))
  $isDebug = true;
  
include_once( 'webappconfig.php' ); 
?>

<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="user-scalable=no, width=device-width, height=device-height">

<title><?php echo($siteTitle); ?></title>
<link rel="icon" href="favicon.ico" type="image/x-icon">
<link rel="shortcut icon" href="favicon.ico" type="image/x-icon"> 
<link rel="stylesheet" href="OpenLayers/theme/default/style.css" type="text/css">
<link rel="stylesheet" href="KaMap/scalebar/scalebar-fat.css" type="text/css"  >
<link rel="stylesheet" href="style/screen.css" type="text/css">
<link rel="stylesheet" href="style/tools.css"  type="text/css">
<link rel="stylesheet" href="style/popup.css"  type="text/css">
<link rel="stylesheet" href="style/aprs.css"   type="text/css">
<?php 
   if ($isMobile)
       echo('<link rel="stylesheet" href="style/mobil.css" type="text/css">');
   else if ($isIframe)
       echo('<link rel="stylesheet" href="style/iframe.css" type="text/css">');


  // Add extra CSS stylesheets
  foreach ($cssIncludes as $inc) 
     echo ('<link rel="stylesheet" href="config/'.$inc.'" type="text/css">');
  
  // Add content of headinclude file
  $headInclude = "/etc/polaric-webapp/".$headInclude;
  if ($headInclude != "" && file_exists($headInclude) ) {
     $fh = fopen($headInclude, 'r');
     while (!feof($fh)) 
       echo fgets($fh);
     fclose($fh);
  }
?>

</head>
<body onload="<?php if ($isMobile) echo("myOnLoad_mobile();");
                    else if ($isIframe) echo ("myOnLoad_iframe();");
                    else echo("myOnLoad();"); ?>">

<?php
  if ($isMobile || $isIframe)
    include_once('form_small.php');
  else
    include_once('form_full.php');
?>

<img id="toolbarToggler" onclick="toggleToolbar(this);" alt="toggle toolbar" src="KaMap/images/a_pixel.gif">
<div id="viewport"> 
<?php
  if ($creditLogo!= ""  && !$isMobile && !$isIframe) 
      echo ('<img id="clogo" src="'.$creditLogo.'">');
?>


<!-- reference information -->
<img id="refToggler" onclick="toggleReference(this);" alt="toggle reference" src="KaMap/images/a_pixel.gif">
<div id="reference">
    <div id="scaleReference">
        <div id="scaleBackground" class="transparentBackground"></div>
        <div id="scalebar"></div>
        <div id="scale">current scale</div>
    </div>
    <div id="geoPosition"></div>
</div>   
       
</div>

<!--[if IE]><script type="text/javascript" src="KaMap/excanvas.js"></script><![endif]-->
<?php
  if (!$isMobile) 
     echo('<script type="text/javascript" src="OpenLayers/lib/Firebug/firebug.js"></script>');
?>
<script type="text/javascript" src="OpenLayers/openlayers-polaric.js"></script>
<script type="text/javascript" src="proj4js-compressed.js"></script>
<script type="text/javascript" src="mapconfig.js"></script>


<?php
  if  (!$isDebug) {
     echo('<script type="text/javascript" src="KaMap/kamap-core.js"></script>');
     echo('<script type="text/javascript" src="XMLOverlay/compiled.js"></script>');
     echo('<script type="text/javascript" src="Aprs/compiled.js"></script>');
  }
  else {
     echo('<script type="text/javascript" src="KaMap/DHTMLapi.js"></script>');
     echo('<script type="text/javascript" src="KaMap/xhr.js"></script>');
     echo('<script type="text/javascript" src="KaMap/touchHandler.js"></script>');
     echo('<script type="text/javascript" src="KaMap/kaMap.js"></script>');
     echo('<script type="text/javascript" src="KaMap/kaTool.js"></script>');
     echo('<script type="text/javascript" src="KaMap/kaQuery.js"></script>');
     echo('<script type="text/javascript" src="KaMap/kaMouseTracker.js"></script>');
     echo('<script type="text/javascript" src="KaMap/scalebar/scalebar.js"></script>');
     echo('<script type="text/javascript" src="XMLOverlay/kaXmlOverlay.js"></script>');
     echo('<script type="text/javascript" src="Aprs/gpx.js"></script>');
     echo('<script type="text/javascript" src="Aprs/iscroll.js"></script>');
     echo('<script type="text/javascript" src="Aprs/popup.js"></script>');
     echo('<script type="text/javascript" src="Aprs/menu.js"></script>');
     echo('<script type="text/javascript" src="Aprs/jscoord.js"></script>');
     echo('<script type="text/javascript" src="Aprs/startUp.js"></script>');
  }
?>
<script type="text/javascript" src="KaMap/tools/kaRubberZoom.js"></script>
<script type="text/javascript" src="KaMap/tools/myKaRuler.js"></script> 
       

</body>
</html>
