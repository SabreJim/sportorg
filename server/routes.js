const express = require('express');
const AWS = require('aws-sdk');
const DynamoLoader = require('../server/middleware/dynamo-loader');
const Postgres = require('./middleware/postgres-service');


const TableBuilder = require('./data-access/table-builder');
const Classes = require('./response-handler/classes');
const Lookups = require('./response-handler/lookups');

const { curry } = require('ramda');

const createRouter = (config) => {
    const router = express.Router();
    const jsonBody = require('body-parser').json();



// middleware that is specific to this router
//     router.use(function timeLog (req, res, next) {
//         console.log('Time: ', Date.now())
//         next()
//     });

    const ctx = {};


    // define the home page route
    router.get('/fencers', function (req, res) {
        console.log('saw ctx', ctx.docClient);
        ctx.dbTable.listTables({}, (err, result) => {
            console.log('tables?', err, result);

        });
        res.send('fencers');
    });

    // lookup item getters
    router.get('/seasons', Lookups.getActiveSeasons);
    router.get('/programs/:seasonId', Lookups.getProgramsBySeason);
    router.get('/program-details', Lookups.getProgramDetails);


    router.get('/classes/', Classes.getAllClasses);

    router.put('/classes', jsonBody, Classes.addClass);

    return router;
};


module.exports = createRouter;