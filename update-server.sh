#!/bin/bash
mongo events --eval "db.Event.drop()"
node /home/events/events-server/read-rss.js

