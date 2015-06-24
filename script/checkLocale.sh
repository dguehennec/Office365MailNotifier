#!/bin/bash

cd "$1"

SED_OPTION="-r"
if [ "$(uname)" == "Darwin" ]; then
    SED_OPTION="-E"
fi

referenceFile=$(mktemp -t message.json)
grep -Eo "\"[a-zA-Z\._]+\": {" en/messages.json | sed $SED_OPTION  "s/(\"|:|\{| )//g" > "$referenceFile"

ls -1 */messages.json | while read file ; do 
    tmpFile=$(mktemp -t message_locale.json)
    grep -Eo "\"[a-zA-Z\._]+\": {" "$file" | sed $SED_OPTION  "s/(\"|:|\{| )//g" > "$tmpFile"
    echo "**** $file ****"
    diff "$referenceFile" "$tmpFile"
    rm "$tmpFile"
done

rm "$referenceFile"
