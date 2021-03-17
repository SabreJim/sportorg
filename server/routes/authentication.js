const Authentication = require('../middleware/server-authentication');
const ResponseHandler = require('../middleware/response-handler');

const adminRequired = async (req, res, next) => {
    const session = await Authentication.getSessionFromHeader(req);
    if (!session || session.isAdmin !== 'Y') {
        ResponseHandler.returnError(res, 'This request requires admin access', 403);
    } else {
        next();
    }
};

const addSession = async (req, res, next) => {
    await Authentication.getSessionFromHeader(req);
    next();
};

const requireSession = async (req, res, next) => {
    const getUserId = (req) => (req.session && req.session.user_id) ? req.session.user_id : -1;
    await Authentication.getSessionFromHeader(req);
    const myUserId = getUserId(req);
    if (myUserId === -1) { // not logged in
        return ResponseHandler.returnSingle(res, {});
    } else {
        next();
    }
};
module.exports = {
    adminRequired,
    addSession,
    requireSession
}