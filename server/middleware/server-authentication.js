const { returnSingle, returnSuccess, returnError } = require('../middleware/response-handler');
const firebase = require('firebase-admin');
const config = require('../../config');
const MySQL = require('../middleware/mysql-service');
const uuid = require('uuid/v4');
const crypto = require('crypto-js');

const application = {
    applicationId: null,
    applicationName: '',
    secretKey: null
};
const defaultSession = { isAnonymous: true, user_id: -1 };
let CurrentSession = Object.assign({}, defaultSession);

const initializeFirebase = async (req, res, next) => {
    if (!firebase.apps.length) {
        // cert can only come from a cert file
        firebase.initializeApp({
            credential: firebase.credential.applicationDefault(),
            databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
        });
    }

    if (!application.secretKey) {
        // get the key from the DB
        const query = `SELECT * from projects WHERE project_name = ? AND type = ?`;
        const appData = await MySQL.runQuery(query, [config.applicationName, 'application']);
        if (appData[0] && appData[0].privateKey) {
            application.applicationId = appData[0].projectId;
            application.applicationName = appData[0].projectName;
            application.secretKey = appData[0].privateKey;
        }
    }
    await next();
};
    // firebase.initializeApp({
    //     credential: admin.credential.refreshToken(refreshToken),
    //     databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
    // });

const decodeToken = (token) => {
    if (token) {
        // decrypt the sessionId
        const byteValue = crypto.AES.decrypt(token, application.secretKey);
        return byteValue.toString(crypto.enc.Utf8);
    }
    return '';
}

const getSessionFromHeader = async(request) => {
    const sportorgToken = request.headers['sportorgtoken'];
    CurrentSession = await getSessionByToken(decodeToken(sportorgToken));

    if (CurrentSession.length === 0) {
        // no user found
        CurrentSession = Object.assign({}, defaultSession);
    }
    request.session = CurrentSession;
    return CurrentSession;
}

const getSessionByToken = async(token) => {
const sessionQuery = `SELECT
            s.session_token as 'sessionToken',
            u.user_id,
            u.is_admin as 'isAdmin',
            m.member_id as 'memberId',
            m.is_active as 'isActive',
            u.email,
            m.year_of_birth
        FROM beaches.users u
        LEFT JOIN beaches.sessions s ON u.user_id = s.user_id
        LEFT JOIN beaches.member_users mu ON mu.user_id = u.user_id AND mu.is_primary = 'Y'
        LEFT JOIN beaches.members m ON m.member_id = mu.member_id
        WHERE s.session_token = ?; `;
    return await MySQL.runCommand(sessionQuery, [token]);
}

const getSession = async(userId) => {
    // get the userId and any other session information required to validate requests from the user
    const sessionQuery = `SELECT
            s.session_token as 'sessionToken',
            u.user_id,
            u.is_admin as 'isAdmin',
            m.member_id as 'memberId',
            m.is_active as 'isActive',
            u.email,
            m.year_of_birth
        FROM beaches.users u
        LEFT JOIN beaches.sessions s ON u.user_id = s.user_id
        LEFT JOIN beaches.member_users mu ON mu.user_id = u.user_id AND mu.is_primary = 'Y'
        LEFT JOIN beaches.members m ON m.member_id = mu.member_id
        WHERE s.user_id = ?; `;
    return await MySQL.runCommand(sessionQuery, [userId]);
};


const verifyToken = async(req, res, next) => {
    const token = req.query.token || false ;
    if (!token) {
        return returnSingle(res);
    }
    const appSession = { };
    // verify a Google login token and retrieve the appUser information
    await firebase.auth().verifyIdToken(token)
        .then(async (decodedToken) => {
            appSession.userId = decodedToken.uid;
            // if an email is not returned by firebase, assign a string value
            let userEmail = decodedToken.email;
            if (!userEmail) {
                userEmail = appSession.userId + '@' + decodedToken.firebase.sign_in_provider;
            }

            // determine the authenticator type
            let authSource = 'google';
            if (decodedToken.firebase.sign_in_provider === 'facebook.com') {
                authSource = 'facebook';
            } // should also decode for twitter

            // get or create a user
            const userQuery = `select beaches.get_or_create_user(?, ?, ?) as 'userId';`;
            const userResponse = await MySQL.runCommand(userQuery, [appSession.userId, authSource, userEmail]);
            // get a sessionToken if a session already exists
            let existingSession = await getSession(userResponse.userId);
            let orgToken; // saving the decoded value in the DB, but passing the encoded version to the client
            if (existingSession && existingSession.sessionToken) {
                orgToken = existingSession.sessionToken;
            } else { // otherwise make a new token
                const newToken = uuid();
                orgToken = uuid();
                // insert the new session
                const sessionInsert = `INSERT INTO beaches.sessions (user_id, session_token) VALUES (?, ?)`;
                await MySQL.runQuery(sessionInsert, [userResponse.userId, orgToken]);
                existingSession = await getSession(userResponse.userId);
            }
            appSession.isAdmin = existingSession.isAdmin;
            appSession.isActive = existingSession.isActive;
            appSession.memberId = existingSession.memberId;
            appSession.sessionToken = crypto.AES.encrypt(orgToken, application.secretKey).toString();
            return returnSingle(res, appSession);
        }).catch(function(error) {
        // Handle error
        console.log('error', error);
        return returnError(res, 'Session could not be created');
    });
};

const endSession = async(req, res, next) => {
    // token has to be passed in body to prevent encoding errors
    const token = req.body.token || false ;
    const decryptedToken = decodeToken(token);
    const sessionQuery = `CALL beaches.purge_sessions( ? );`;
    await MySQL.runQuery(sessionQuery, [decryptedToken]);
    return returnSuccess(res,true);
}

module.exports = {
    initializeFirebase,
    verifyToken,
    endSession,
    getSession,
    getSessionFromHeader,
    CurrentSession
};