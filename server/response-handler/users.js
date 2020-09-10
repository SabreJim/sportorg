const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle, returnError } = require('../middleware/response-handler');
const { userSchema, getCleanBody } = require('../middleware/request-sanitizer');

const getUsers = async(req, res, next) => {
    const myUserId = (req.session && req.session.user_id) ? req.session.user_id : -1;
    const query = `SELECT 
                    u.user_id,
                    u.email,
                    u.is_admin,
                    (CASE WHEN uga.group_ids IS NULL THEN 'N' ELSE 'Y' END) as 'is_fitness_admin',
                    u.file_admin,
                    u.event_admin,
                    u.display_name,
                    u.google_id,
                    u.fb_id, 
                    u.twitter_id
                    from users u
                    LEFT JOIN (SELECT CONCAT('[', GROUP_CONCAT(group_id), ']') group_ids, user_id from beaches.user_group_admins GROUP BY user_id) uga ON uga.user_id = u.user_id
        WHERE (SELECT u2.is_admin FROM users u2 where u2.user_id = ${myUserId}) = 'Y'`;
    const users = await MySQL.runQuery(query);
    returnResults(res, users);
};

const updateUser = async (req, res, next) => {
    let body = req.body;
    const cleanUser = getCleanBody(body, userSchema);
    if (cleanUser.isValid) {
        if (cleanUser.isEdit) {
            // only edit users, creation is handled by oAuth
            const statement = `UPDATE users SET ${cleanUser.setters.join(', ')} WHERE user_id = ${cleanUser.cleanBody.userId}`;
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
}

const getMyProfile =  async (req, res) => {
    const myUserId = (req.session && req.session.user_id) ? req.session.user_id : -1;
    const query = `SELECT
            u.user_id,
            u.display_name,
            (CASE WHEN u.fb_id IS NULL THEN 'Google' ELSE 'Facebook'END) login_method,
            (CASE WHEN mmu.is_primary IS NULL THEN 'N' ELSE 'Y' END) has_member,
            (SELECT mm.email) my_email,
            (SELECT mm.street_address) my_address,
            GROUP_CONCAT(CONCAT(m.first_name, ' ', m.last_name)) my_fencers
            
        FROM beaches.users u
        LEFT JOIN beaches.member_users mmu ON mmu.user_id = u.user_id AND mmu.is_primary = 'Y'
        LEFT JOIN beaches.members mm ON mm.member_id = mmu.member_id
        LEFT JOIN beaches.member_users mu ON mu.user_id = u.user_id
        LEFT JOIN beaches.members m ON m.member_id = mu.member_id
        WHERE u.user_id = ${myUserId}
        GROUP BY u.user_id, u.display_name, login_method, has_member, my_email, my_address;`;
    const myProfile = await MySQL.runQuery(query);
    returnSingle(res, myProfile[0]);
};

module.exports = {
    getUsers,
    updateUser,
    deleteUser,
    getMemberUsers,
    linkMembers,
    getMyProfile
};