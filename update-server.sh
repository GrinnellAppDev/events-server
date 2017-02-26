#!/bin/bash
date
mongo events --eval "db.Event.drop()"
/usr/local/bin/node /home/events/events-server/read-rss.js

