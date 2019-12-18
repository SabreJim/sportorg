const express = require('express');
const Classes = require('./response-handler/classes');
const Programs = require('./response-handler/programs');
const Lookups = require('./response-handler/lookups');
const Authentication = require('./middleware/server-authentication');
const ResponseHandler = require('./middleware/response-handler');

const { curry } = require('ramda');

const createRouter = (config) => {
    const router = express.Router();
    const jsonBody = require('body-parser').json();

// middleware that is specific to this router
//     router.use(function timeLog (req, res, next) {
//         console.log('Time: ', Date.now())
//         next()
//     });

    const adminRequired = async (req, res, next) => {
        const session = await Authentication.getSessionFromHeader(req);
        console.log('check admin', session);
        if (!session || session.isAdmin !== 'Y') {
            ResponseHandler.returnError(res, 'This request requires admin access', 403);
        } else {
            next();
        }
    };
    const addSession = async (req, res, next) => {
        const session = await Authentication.getSessionFromHeader(req);
        next();
    };

    // lookup item getters
    router.get('/programs/:seasonId', Lookups.getProgramsBySeason);
    router.get('/fees', Lookups.getFeeStructures);
    router.get('/lookups', Lookups.getLookupValues);
    router.get('/menus', Lookups.getMenus);

    // Class getters and setters
    router.get('/all-classes', addSession, Classes.getAllClasses);
    router.put('/classes', jsonBody, adminRequired, Classes.upsertClass);
    router.delete('/classes/:scheduleId', adminRequired, Classes.deleteClass);

    // Program getters and setters
    router.get('/all-programs', addSession, Programs.getAllPrograms);
    router.get('/programs', Programs.getActivePrograms);
    router.put('/programs', jsonBody, adminRequired, Programs.upsertProgram);
    router.delete('/programs/:programId', adminRequired, Programs.deleteProgram);

    // member/athlete endpoints
    router.get('/fencers', function (req, res) {
        res.send('fencers');
    });

    // event endpoints


    // session management
    router.get('/session-token', Authentication.verifyToken);
    router.put('/end-session', jsonBody, Authentication.endSession);

    return router;
};


module.exports = createRouter;