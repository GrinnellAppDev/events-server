echo POSTING
curl -X POST \
  -H "X-Parse-Application-Id: f8dd0d83bdc78b82378bb69e725d2f28" \
  -H "Content-Type: application/json" \
  -d '{"name":"testevent","date":"tomorrow","isitlit":true}' \
  http://localhost:8999/parse/classes/Events

curl -H "X-Parse-Application-Id: f8dd0d83bdc78b82378bb69e725d2f28" http://localhost:8999/parse/classes/Events
