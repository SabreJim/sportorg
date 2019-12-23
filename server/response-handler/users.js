const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle, returnError } = require('../middleware/response-handler');
const { memberSchema, getCleanBody } = require('../middleware/request-sanitizer');

const getUsers = async(req, res, next) => {
    const myUserId = (req.session && req.session.user_id) ? req.session.user_id : -1;
    const query = `SELECT 
                    user_id,
                    email,
                    is_admin,
                    google_id,
                    fb_id, 
                    twitter_id
                    from users
        WHERE (SELECT u.is_admin FROM users u where u.user_id = ${myUserId}) = 'Y'`;
    const users = await MySQL.runQuery(query);
    returnResults(res, users);
};

const updateUser = async (req, res, next) => {
    let body = req.body;
    const cleanMember = getCleanBody(body, memberSchema);
    if (cleanMember.isValid) {
        if (cleanMember.isEdit) {
            // only edit users, creation is handled by oAuth
            const statement = `UPDATE users SET ${cleanMember.setters.join(', ')} WHERE user_id = ${cleanMember.cleanBody.userId}`;
            const statementResult = await MySQL.runCommand(statement);
            if (statementResult && statementResult.affectedRows) {
                returnSingle(res, {affectedRows: statementResult.affectedRows});
            } else {
                returnError(res, 'An error occurred when updating this record');
            }
        }
    } else {
        returnError(res,'User could not be updated');
    }
};


const deleteUser = async (req, res) => {
    const userId = req.params.userId;
    if (!userId) {
        return returnError(res, 'A user ID is required');
    }
    const statement = `DELETE FROM users WHERE user_id = ${userId}`;
    const statementResult = await MySQL.runCommand(statement);
    if (statementResult && statementResult.affectedRows) {
        returnSingle(res, {affectedRows: statementResult.affectedRows});
    } else {
        returnError(res, 'An error occurred when deleting this record');
    }
};

const getMemberUsers = async (req, res) => {
    const myUserId = (req.session && req.session.user_id) ? req.session.user_id : -1;
    const query = `SELECT 
                    mu.user_id,
                    u.email,
                    mu.member_id,
                    CONCAT(m.last_name, ', ', m.first_name) as 'member_name'
                    from member_users mu
                    LEFT JOIN users u ON u.user_id = mu.user_id
                    LEFT JOIN members m ON m.member_id = mu.member_id
        WHERE (SELECT u.is_admin FROM users u where u.user_id = ${myUserId}) = 'Y'`;
    const users = await MySQL.runQuery(query);
    returnResults(res, users);
};
const linkMembers = async(req, res) => {
    // link a member to a user
    const userId = req.params.userId;
    const memberId = req.params.memberId;
    const setStatus = req.params.setStatus;
    if (setStatus === 'false') {
        // delete t{he relational row
        const statement = `DELETE FROM member_users WHERE member_id = ${memberId} && user_id = ${userId}`;
        const result = await MySQL.runCommand(statement);
        if (result && result.affectedRows) {
            returnSingle(res, {affectedRows: result.affectedRows});
        } else {
            returnError(res, 'An error occurred when deleting this record');
        }
    } else {
        const command = `CALL assign_member_to_user (${userId}, ${memberId} )`;
        const result = await MySQL.runCommand(command);
        if (result && result.affectedRows) {
            returnSingle(res, {affectedRows: 1});
        } else {
            returnError(res, 'An error occurred when linking the member');
        }
    }
    console.log('got params to link', userId, memberId, setStatus, typeof setStatus);
}

module.exports = {
    getUsers,
    updateUser,
    deleteUser,
    getMemberUsers,
    linkMembers
};