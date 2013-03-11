##########################################################################
## Change macros below according to your environment and your needs
##
##########################################################################

# Review (and if necessary) change these if you are going to 
# install directly by using this makefile

   INSTALL_BIN = $(DESTDIR)/usr/bin
INSTALL_CONFIG = $(DESTDIR)/etc/polaric-webapp
   INSTALL_WEB = $(DESTDIR)/var/www/aprs
 INSTALL_DATA  = $(DESTDIR)/var/lib/polaric
   INSTALL_LOG = $(DESTDIR)/var/log/polaric/kamap
   


##################################################
##  things below should not be changed
##
##################################################


all: compile

install: Aprs/compiled.js
	install -d $(INSTALL_CONFIG)
	install -d $(INSTALL_CONFIG)/www
	install -d $(INSTALL_CONFIG)/www/auto
	install -d $(INSTALL_CONFIG)/mapserv
	install -d $(INSTALL_BIN)
	install -m 755 -d $(INSTALL_LOG)
	install -d $(INSTALL_WEB)/Aprs $(INSTALL_WEB)/images $(INSTALL_WEB)/KaMap $(INSTALL_WEB)/OpenLayers \
	           $(INSTALL_WEB)/style $(INSTALL_WEB)/www/dicons $(INSTALL_WEB)/XMLOverlay $(INSTALL_WEB)/jquery \
	           $(INSTALL_WEB)/jquery/smoothness/images
	install -d $(INSTALL_WEB)/KaMap/config $(INSTALL_WEB)/KaMap/images $(INSTALL_WEB)/KaMap/images/icon_set_nomad \
		   $(INSTALL_WEB)/KaMap/scalebar $(INSTALL_WEB)/KaMap/tools
	install -d $(INSTALL_WEB)/kacache2
	chown www-data.www-data $(INSTALL_WEB)/kacache2
	install -m 644 htaccess $(INSTALL_WEB)/.htaccess
	install -m 755 polaric-passwd $(INSTALL_BIN)
	install -m 644 form_full.php form_small.php index.php  $(INSTALL_WEB)
	install -m 644 iconx.png login.php nrrl.gif proj4js-compressed.js robots.txt $(INSTALL_WEB)
	install -m 644 images/* $(INSTALL_WEB)/images
	install -m 644 style/*.css $(INSTALL_WEB)/style
#	install -m 644 www/dicons/*.png $(INSTALL_WEB)/www/dicons
	install -m 644 jquery/jquery-min.js jquery/jquery-ui-min.js $(INSTALL_WEB)/jquery
	install -m 644 jquery/smoothness/*.css $(INSTALL_WEB)/jquery/smoothness
	install -m 644 jquery/smoothness/images/*.png $(INSTALL_WEB)/jquery/smoothness/images
	install -m 644 Aprs/compiled.js Aprs/gpx.js Aprs/iframeApi.js $(INSTALL_WEB)/Aprs
	install -m 644 XMLOverlay/compiled.js $(INSTALL_WEB)/XMLOverlay
	install -m 644 KaMap/kamap-core.js KaMap/*.php $(INSTALL_WEB)/KaMap
	install -m 644 KaMap/excanvas.js $(INSTALL_WEB)/KaMap
	install -m 644 KaMap/images/*.png KaMap/images/*.gif KaMap/images/*.cur $(INSTALL_WEB)/KaMap/images
	install -m 644 KaMap/images/icon_set_nomad/*.png KaMap/images/icon_set_nomad/*.gif $(INSTALL_WEB)/KaMap/images/icon_set_nomad
	install -m 644 KaMap/scalebar/*.js KaMap/scalebar/*.gif KaMap/scalebar/*.css $(INSTALL_WEB)/KaMap/scalebar
	install -m 644 KaMap/tools/*.js $(INSTALL_WEB)/KaMap/tools
	cp -R OpenLayers/* $(INSTALL_WEB)/OpenLayers
	
        # Config files are placed in /etc and should be symlinked from the webapp directory 
	install -m 644 KaMap/mapserv/*.map $(INSTALL_CONFIG)/mapserv       
	install -m 644 KaMap/config/config.php $(INSTALL_CONFIG)/kamap-config.php
	install -m 644 mapconfig.js  $(INSTALL_CONFIG)/mapconfig.js
	install -m 644 webappconfig.php $(INSTALL_CONFIG)
	install -m 644 users $(INSTALL_CONFIG)


compile: 
	sh compile-js.sh
	


clean:

