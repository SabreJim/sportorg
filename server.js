// Include the cluster module
const cluster = require('cluster');
const AWS = require('aws-sdk');
const Koa = require('koa');
const bodyParser = require('koa-body');
const KoaStatic = require('koa-static');
const DynamoLoader = require('./middleware/dynamo-loader');
const routes = require('./server/routes');
const staticdir = process.env.NODE_ENV === 'production' ? 'dist.prod' : 'dist.dev';

const runServer = async function(){
    AWS.config.update({
        region: "us-west-2",
        endpoint: "http://localhost:9999"
    });
    const config = {
        region: "us-west-2",
        endpoint: "http://localhost:9999"
    };

    const sns = new AWS.SNS();

    const ddb = new AWS.DynamoDB();

    const ddbTable = process.env.STARTUP_SIGNUP_TABLE;
    const snsTopic = process.env.NEW_SIGNUP_TOPIC;
    const app = new Koa();

    app.use(DynamoLoader.buildDBConnections(config));
    app.use(bodyParser());
    app.use(KoaStatic(__dirname + '/' + staticdir));


    app.use(routes.securedRoutes(ddb));
        //app.use(routes.pages().routes());
        //app.use(routes.pages().allowedMethods());



        const port = process.env.PORT || 3000;
        const server = app.listen(port);

        console.log('Server running at http://127.0.0.1:' + port + '/');

};

// Code to run if we're in the master process
if (cluster.isMaster) {

    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // Listen for terminating workers
    cluster.on('exit', function (worker) {

        // Replace the terminated workers
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();

    });

// Code to run if we're in a worker process
} else {
    runServer();
}