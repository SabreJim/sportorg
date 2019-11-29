const express = require('express');
const HTTPS = require('https');
const fs = require('fs');
const app = express();
const path = require('path');
const mysqlDB = require('./server/middleware/mysql-service');
const firebase = require('./server/middleware/server-authentication');


// process.argv.forEach((val) => {
//     // read the environment in from the command parameters
//     if (val.indexOf('env=') === 0){
//         environment = val.slice(4);
//     }
// });
const config = require('./config.js');
let useSsl = process.env.USE_SSL || false;

// ready in environment variable
if (process.env && process.env.SPORTORG_MYSQL && config.mysql){
    // keep login information in environment variables
    config.mysql.password = process.env.SPORTORG_MYSQL;
    config.mysql.user = process.env.SPORTORG_USER;
    config.mysql.database = process.env.SPORTORG_DB;
    console.log('Configuring DB from environment variable');
}
// establish DB connection pool
mysqlDB.buildDBConnections(config);
app.use('/rest', firebase.initializeFirebase);

app.use('/', async(req, res, next) => {
    console.log('intercept!', req.originalUrl);
    await next();
})

// a REST router for server-side calls
const appRouter = require('./server/routes');
app.use('/rest', appRouter(config));

// a router to handle all static page requests
app.use('/app', express.static(path.join(__dirname, '/sportorg-client/dist/sportorg-client')));

app.use('/', async (req, res) => {
    await res.redirect('/app');
});
const port = (config.port) ? config.port : 8080;

if (useSsl){
    const privateKey  = fs.readFileSync('rsa/selfsigned.key', 'utf8');
    const certificate = fs.readFileSync('rsa/selfsigned.crt', 'utf8');
    const HTTPSserver = HTTPS.createServer({key: privateKey, cert: certificate}, app);
    HTTPSserver.listen(port, () => console.log(`App listening on SSL port: ${port}`));
} else {
    app.listen(port, () => console.log(`App listening on port: ${port}`));
}



