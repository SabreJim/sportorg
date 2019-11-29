const { returnSingle } = require('../middleware/response-handler');
const firebase = require('firebase-admin');


const initializeFirebase = async (req, res, next) => {
    if (!firebase.apps.length){
        firebase.initializeApp({
            credential: firebase.credential.applicationDefault(),
            databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
        });
    }
    await next();
};
    // firebase.initializeApp({
    //     credential: admin.credential.refreshToken(refreshToken),
    //     databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
    // });


const verifyToken = async(req, res, next) => {
    const token = req.query.token || false ;
    if (!token) {
        return returnSingle(res);
    }
    const appUser = {
        name: 'fromDB'
    };
    // verify a Google login token and retrieve the appUser information
    await firebase.auth().verifyIdToken(token)
        .then(function(decodedToken) {
            appUser.uid = decodedToken.uid;
            console.log('got decoded??', appUser);
            return returnSingle(res, appUser);
        }).catch(function(error) {
        // Handle error
        console.log('error', error);
        return returnSingle(res);
    });
};

module.exports = {
    initializeFirebase,
    verifyToken
};