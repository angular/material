sed -i '' 's/material/md/g' $(ag -g css docs)
sed -i '' 's/md\./material\./g' $(ag -g css docs)
sed -i '' 's/Material/Md/g' $(ag -g css docs)
sed -i '' 's/ngMd/ngMaterial/g' $(ag -g css docs)

