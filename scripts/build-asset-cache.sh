#!/bin/bash

echo {
for i in $(find docs/app/{img/icons,icons} -type f -name *.svg); do
  filename=`echo $i | sed "s/docs\/app\///"`
  contents=`cat $i | tr -d '\r\n'`
  echo -e \'$filename\' : \'$contents\',
done
echo }
