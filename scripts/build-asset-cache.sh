#!/bin/bash

# Intended to generate an object literal of SVG images
# key - relative path to file.
# value - contents of the SVG.
#
# See the following guide about the process to update the asset cache:
# https://github.com/angular/material/blob/feature/edit-example-on-codepen/docs/guides/CODEPEN.md

echo {
for i in $(find docs/app/{img/icons,icons} -type f -name *.svg); do
  filename=`echo $i | sed "s/docs\/app\///"`
  contents=`cat $i | tr -d '\r\n'`
  echo -e \'$filename\' : \'$contents\',
done
echo }
