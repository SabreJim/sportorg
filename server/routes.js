const express = require('express');
const AWS = require('aws-sdk');
const DynamoLoader = require('../server/middleware/dynamo-loader');
const Postgres = require('./middleware/postgres-service');


const TableBuilder = require('./data-access/table-builder');
const Classes = require('./response-handler/classes');

const { curry } = require('ramda');

const createRouter = (config) => {
    const router = express.Router();
    const jsonBody = require('body-parser').json();



// middleware that is specific to this router
// router.use(function timeLog (req, res, next) {
//     console.log('Time: ', Date.now())
//     next()
// })
    // create the AWS middleware and use it on the appRouter
    const sns = new AWS.SNS();

    const ddb = new AWS.DynamoDB();

    const ctx = {};


  // router.use(DynamoLoader.buildDBConnectionsXP(config.AWS, ctx));

    // define the home page route
    router.get('/fencers', function (req, res) {
        console.log('saw ctx', ctx.docClient);
        ctx.dbTable.listTables({}, (err, result) => {
            console.log('tables?', err, result);

        });
        res.send('fencers');
    });

    router.get('/rebuild-tables', curry(TableBuilder.rebuildTables)(ctx));


    router.get('/classes/', curry(Classes.searchClasses)(ctx));
    router.put('/classes', jsonBody, curry(Classes.addClass)(ctx));

    return router;
};


module.exports = createRouter;