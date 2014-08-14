
<!-- top toolbar, title and navigation -->
<form>
<div id="anchor"></div>
<div id="toolbar">
   <div id="toolbarBackground" class="transparentBackground"></div> 
   <div id="tools" style="text-align:center; padding-top:4px">
       <div class="kmTitle"><?php echo($screenTitle) ?></div>

       <div id="sarmode"><img src="images/sar.png" title="SAR modus"></div>
       <div id="login"><a href="login.php" title="Logg inn">
                  <img src="images/password.png"></a></div>&nbsp;
       
       <img id="buttonMenu" src="images/exec.gif" alt="Meny...">&nbsp;
       <img id="areaSelect" title="Velg område/kartutsnitt" src="images/areaselect.png">
       <img id="filterMenu" title="Filter profil" src="images/filter.png">
       <div id="filterChoice">..</div>
       
       &nbsp;
       <img id="toolRuler" onclick="switchMode(this.id)" title="Measure distance" alt="Measure distance" src="KaMap/images/a_pixel.gif" > 
       <img id="toolQuery" onclick="switchMode(this.id)" title="Click and drag or double click to query the Map" alt="Click and drag or double click to query the Map" src="KaMap/images/a_pixel.gif" > 
       <img id="toolPan"   onclick="switchMode(this.id)" title="Click and drag to Navigate the Map" alt="Click and drag to Navigate the Map" src="KaMap/images/a_pixel.gif">
       <img id="toolZoomOut" onclick="myKaMap.zoomOut()" title="zoom Out" alt="zoom Out" src="KaMap/images/a_pixel.gif">
       <img id="toolZoomIn"  onclick="myKaMap.zoomIn()"  title="zoom in"  alt="zoom in"  src="KaMap/images/a_pixel.gif" >
       <img id="toolZoomRubber" onclick="switchMode(this.id)" title="rubber zoom" alt="rubber zoom" src="KaMap/images/a_pixel.gif" >
       <div id="permolink">&nbsp;</div>
    </div>
    <div id="kaLogo">    
        <a href="http://la3t.no/polaricserver/" target="_blank">
        <img alt="Powered by Polaric Server" src="KaMap/images/PolaricServer_s.png" border="0"></a>
    </div>
</div>  <!-- id=toolbar -->
</form>