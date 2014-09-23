# Polaric webapp

The "Polaric Server" is mainly a web based service to present APRS 
tracking information on maps and where the information is updated at real-
time. It is originally targeted for use by radio amateurs in voluntary search
and rescue service in Norway. It consists of a web application and a server 
program (APRS daemon). 

The web application lets the user browse maps. It can present live APRS 
infomation (from the aprsd backend) on top of the map. Users can update 
information, add objects, etc.. The application comes with its own server 
side map server (based on KaMap/Mapserver) that can render and/or cache maps. 
Web clients can also be set up to use external map sources directly. 

More documentation on the project can be found here: 
http://aprs.no/dokuwiki/doku.php?id=polaricserver

## System requirements

Linux/Apache/PHP platform (tested with Debian/Ubuntu/Mint) with
php5-mapscript and php5-gd installed.

We support automatic installation packages for Debian/Ubuntu. 
It shouldn't be too hard to port it to e.g. Windows if anyone wants to 
 

## Installation

We provide Debian files. For information on getting started on a Debian based
platform please see: http://aprs.no/dokuwiki/doku.php?id=installation

More documentation on the project can be found here: 
http://aprs.no/dokuwiki/doku.php?id=polaricserver

## Building from source 

Build from the source is done by a plain old makefile. Yes I know :)
Setup for generating Debian packages is included. You may use the 'debuild' 
command.

You will need the Closure Compiler from Google to compress the javascript 
code. See compile-js.sh. 

