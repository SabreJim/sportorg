const Authentication = require('../middleware/server-authentication');
const ResponseHandler = require('../middleware/response-handler');
const Users = require('../response-handler/users');

const adminRequired = async (req, res, next) => {
    const session = await Authentication.getSessionFromHeader(req);
    if (!session || session.isAdmin !== 'Y') {
        ResponseHandler.returnError(res, 'This request requires admin access', 403);
    } else {
        next();
    }
};

const requireRole = (roleName) => {
    return async (req, res, next) => {
        const session = await Authentication.getSessionFromHeader(req);
        if (!session || !session.user_id) {
            ResponseHandler.returnError(res, `This request requires you to be logged in`, 403);
        } else {
            // also get roles for the session
            const roles = await Users.lookupUserRoles(session.user_id);
            if (roles) {
                let foundRole = roles.find((r) => {
                   return r.roleName === roleName && r.selected === 'Y';
                });
                if (foundRole) {
                    return next();
                }
            }
            ResponseHandler.returnError(res, `This request requires a specific role`, 403);
        }
    };
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
    requireRole,
    addSession,
    requireSession
}