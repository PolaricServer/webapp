#!/bin/bash

#
# ccompile er et skript som kjører Google Closure Compiler: 
#  java -jar closure-compiler.jar $*
#
PATH=$PATH:/home/oivindh/bin

cd KaMap
ccompile --js DHTMLapi.js --js xhr.js --js kaMap.js --js kaTool.js --js kaQuery.js --js kaMouseTracker.js --js scalebar/scalebar.js > kamap-core.js
cd ..
cd XMLOverlay
ccompile --js kaXmlOverlay.js > compiled.js
cd ..
cd Aprs
ccompile --js gpx.js --js popup.js --js menu.js --js jscoord.js --js startUp.js > compiled.js
cd ..
