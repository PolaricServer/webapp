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
	install -d $(INSTALL_BIN)
	install -d $(INSTALL_DATA)
	install -d $(INSTALL_DATA)/mapcache
	install -m 755 -d $(INSTALL_LOG)
	install -d $(INSTALL_WEB)/Aprs $(INSTALL_WEB)/images $(INSTALL_WEB)/KaMap $(INSTALL_WEB)/OpenLayers \
	           $(INSTALL_WEB)/style $(INSTALL_WEB)/www/dicons $(INSTALL_WEB)/XMLOverlay $(INSTALL_WEB)/jquery \
	           $(INSTALL_WEB)/jquery/images $(INSTALL_WEB)/i18n $(INSTALL_WEB)/i18n/msgs
	install -d $(INSTALL_WEB)/KaMap/images $(INSTALL_WEB)/KaMap/images/icon_set_nomad \
		   $(INSTALL_WEB)/KaMap/scalebar $(INSTALL_WEB)/KaMap/tools
	chown www-data.www-data $(INSTALL_DATA)/mapcache
	install -m 644 htaccess $(INSTALL_WEB)/.htaccess
	install -m 755 polaric-passwd $(INSTALL_BIN)
	install -m 644 form_full.php form_small.php index.php  $(INSTALL_WEB)
	install -m 644 iconx.png login.php nrrl.gif proj4js-compressed.js robots.txt $(INSTALL_WEB)
	install -m 644 images/* $(INSTALL_WEB)/images
	install -m 644 style/*.css $(INSTALL_WEB)/style
	install -m 644 jquery/jquery-min.js jquery/jquery-ui-min.js $(INSTALL_WEB)/jquery
	install -m 644 jquery/*.css $(INSTALL_WEB)/jquery
	install -m 644 jquery/images/*.png $(INSTALL_WEB)/jquery/images
	install -m 644 Aprs/*.js $(INSTALL_WEB)/Aprs
	install -m 644 Aprs/compiled.js Aprs/configSupport.js Aprs/iframeApi.js $(INSTALL_WEB)/Aprs
	install -m 644 XMLOverlay/compiled.js $(INSTALL_WEB)/XMLOverlay
	install -m 644 KaMap/kamap-core.js $(INSTALL_WEB)/KaMap
	install -m 644 KaMap/excanvas.js $(INSTALL_WEB)/KaMap
	install -m 644 KaMap/images/*.png KaMap/images/*.gif KaMap/images/*.cur $(INSTALL_WEB)/KaMap/images
	install -m 644 KaMap/images/icon_set_nomad/*.png KaMap/images/icon_set_nomad/*.gif $(INSTALL_WEB)/KaMap/images/icon_set_nomad
	install -m 644 KaMap/scalebar/*.js KaMap/scalebar/*.gif KaMap/scalebar/*.css $(INSTALL_WEB)/KaMap/scalebar
	install -m 644 KaMap/tools/*.js $(INSTALL_WEB)/KaMap/tools
	install -m 644 i18n/compiled.js $(INSTALL_WEB)/i18n
	install -m 644 i18n/msgs/*.json $(INSTALL_WEB)/i18n/msgs
	cp -R OpenLayers/* $(INSTALL_WEB)/OpenLayers
	
        # Config files are placed in /etc and should be symlinked from the webapp directory     
	install -m 644 mapconfig.js  $(INSTALL_CONFIG)/mapconfig.js
	install -m 644 mapcache.xml $(INSTALL_CONFIG)/mapcache.xml
	install -m 644 webappconfig.php $(INSTALL_CONFIG)
	install -m 644 users $(INSTALL_CONFIG)
	
	# To keep Lintian happy (redundant license file)
	rm $(INSTALL_WEB)/OpenLayers/lib/Firebug/license.txt



compile: 
        # Repeat p2json for each po file to be used
	python po2json.py i18n/msgs/no.po
	sh compile-js.sh
	


clean:

