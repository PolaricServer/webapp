#!/bin/bash

#
# ccompile er et skript som kjører Google Closure Compiler: 
#  java -jar closure-compiler.jar $*
#
PATH=$PATH:/home/oivindh/bin

cd KaMap
ccompile --js eventManager.js --js DHTMLapi.js --js xhr.js --js touchHandler.js --js kaMap.js --js kaTool.js --js kaQuery.js --js kaMouseTracker.js --js scalebar/scalebar.js > kamap-core.js
cd ..
cd XMLOverlay
ccompile --js labelStyle.js --js kaXmlOverlay.js --js kaXmlSymbol.js --js kaXmlFeature.js --js kaXmlIcon.js --js kaXmlLabel.js --js kaXmlPoint.js --js imgRotate.js > compiled.js
cd ..
cd Aprs
ccompile --js iscroll.js --js popup.js --js js.cookie.js --js WXreport.js --js statkartWPS.js --js statkartName.js --js statkartAddress.js --js auth.js --js api.js --js contextmenu.js --js mapupdate.js --js messages.js --js menu.js --js layerSwitcher.js --js jscoord.js --js filterProfile.js --js startUp.js > compiled.js
cd ..
cd MobileApp
ccompile --js mobileApp.js --js gpsTracker.js > compiled.js
cd ..
cd i18n
ccompile --js icu.js --js translate.js > compiled.js
cd ..
