#! /bin/bash
set -xe

get_last_published_version() {
  curl -s --location --request POST 'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery' \
--header 'accept: application/json;api-version=6.1-preview.1;excludeUrls=true' \
--header 'Content-Type: application/json' \
--data-raw "{
    \"filters\": [
        {
            \"criteria\": [
                {
                    \"filterType\": 7,
                    \"value\": \"$1\"
                }
            ],
            \"direction\": 2,
        }
    ],
    \"flags\": 103
}" | jq -r '.results[0].extensions[0].versions[0].version'
}

get_package_name() {
  echo $(cat $1 | jq -r '.publisher').$(cat $1 | jq -r '.name')
}

get_package_version() {
  echo $(cat $1 | jq -r '.version')
}

find . -mindepth 2 -iname "package.json" -and -not -ipath "*node_modules*" | sort | while read packageJson; do
  packageName=$(get_package_name $packageJson)
  newVersion=$(get_package_version $packageJson)
  oldVersion=$(get_last_published_version $packageName)
  if [ "$newVersion" != "$oldVersion" ]; then
    cd $(dirname $packageJson);
    echo "publishing itmcdev.$packageName..."
    if [[ "$VSCE_TOKEN" != "" ]]; then
      ../node_modules/.bin/vsce publish --skip-duplicate -p $VSCE_TOKEN;
    else
	    ../node_modules/.bin/vsce publish --skip-duplicate;
    fi
    cd ..;
  else
    echo "Skipping publish on $packageName. No new version created..."
  fi
done
