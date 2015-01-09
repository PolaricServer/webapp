 
#!/bin/bash
echo "Making i18n/msgs/messages.pot from all javascript sources"
find . -name '*.js' > .files-to-extract
xgettext -L JavaScript -i --no-wrap --from-code utf-8 -F -f .files-to-extract \
-ktrc:1c,2 -ktrcw:1c,2 -ktrcf:1c,2 -ktrcfw:1c,2 -ktr -ktrj -ktrfj \
-ktrw -ktrf -ktrfw --force-po --omit-header -o i18n/msgs/messages.pot
rm .files-to-extract