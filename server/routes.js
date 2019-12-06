const express = require('express');
const AWS = require('aws-sdk');

const TableBuilder = require('./data-access/table-builder');
const Classes = require('./response-handler/classes');
const Lookups = require('./response-handler/lookups');
const Authentication = require('./middleware/server-authentication');

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
        res.send('fencers');
    });

    // lookup item getters
    router.get('/seasons', Lookups.getActiveSeasons);
    router.get('/programs/:seasonId', Lookups.getProgramsBySeason);
    router.get('/all-classes', Lookups.getAllClasses);  // TODO: lots of overlap with this and /classes/
    router.get('/program-details', Lookups.getProgramDetails);
    router.get('/fees', Lookups.getFeeStructures);

    router.get('/classes/', Classes.getAllClasses);

    router.put('/classes', jsonBody, Classes.addClass);

    router.get('/session-token', Authentication.verifyToken);
    router.put('/end-session', jsonBody, Authentication.endSession);

    return router;
};


module.exports = createRouter;