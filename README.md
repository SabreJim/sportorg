# Angular (Material) and NodeJS application for serving regional sport organizations

## Features
* google OAuth2 for users
* manage content for updating members
* create and run tournaments within the application

### configuring local MySQL
1. install MySQL server
2. add appuser account @localhost and create database
3. add optional external account @ '%'
4. grant permissions for external account on appuser database 

### Using the Firebase server-side configuration
1. paste in the Firebase configuration file
2. update the environment variable to point to the file: 
export GOOGLE_APPLICATION_CREDENTIALS="/server/sportorg/server/beaches-sportorg-firebase-adminsdk-jfp8a-40b94b9e9c.json";

### config changes to make
1. switch to local mySQL. edit /etc/mysql/mysql.conf.d/mysqld.cnf. set bind-address to 127.0.0.1
2. update config.js to use localhost
3. restart sql sudo /etc/init.d/mysql restart
4. updating Apache to allow ssl:443 and a dev implementation redirect
5. in /etc/apache2/sites-enabled 

### Deploying to the PROD server
1. commit changes to github, then merge to master
2. ssh into the PROD server
3. git pull master branch
4. npm run prod-deploy
5. On interserver, not enough memory to run regular build. Use `npm run build:prod`