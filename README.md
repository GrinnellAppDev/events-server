### Backend for Grinnell Appdev's Events app

## Steps to get server running:

Get the newest node using a ppa, as shown here https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-16-04

Install MongoDB as shown here: https://www.linode.com/docs/databases/mongodb/install-mongodb-on-ubuntu-16-04 
No need too create users.

Clone the Repo
`cd events-server

install npm dependencies

`npm install

create server file

`cp example-server.js server.js

Edit server.js to include the correct masterkey. Do not add this back to the Repo.

Create the service file to start the server automatically

`sudo cp parse-server.service /etc/systemd/system
reload systemctl to see the new service:
`systemctl daemon-reload
Enable the service:
`sudo systemctl enable parse-server
Start the service:
`sudo systemctl start parse-server
Confirm the service is running:
`systemctl status parse-server

set update script to be executable :
`chmod +x update-server.sh

create a crontab for events to run the update script:
`crontab -e
`@daily node /home/events/events-server/update-server >> /home/events/events-server/log.txt

Create ProxyPass for apache as shown here: https://www.digitalocean.com/community/tutorials/how-to-use-apache-http-server-as-reverse-proxy-using-mod_proxy-extension 

Run the update-server script
Run the test on your local machine, and see if it works!
