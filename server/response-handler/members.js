const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle, returnError } = require('../middleware/response-handler');
const { memberSchema, getCleanBody } = require('../middleware/request-sanitizer');

const getMyMembers = async(req, res, next) => {
    const myUserId = (req.session && req.session.user_id) ? req.session.user_id : -1;
    const query = `SELECT
            m.member_id,
            m.first_name,
            m.middle_name,
            m.last_name,
            CONCAT (m.last_name, ', ', m.first_name) as 'name',
            m.year_of_birth,
            m.compete_gender,
            m.is_active,
            m.is_athlete,
            DATE_FORMAT(m.membership_start, '%Y-%m-%d') as 'membership_start',
            m.street_address,
            m.city,
            m.province_id,
            r.region_name as province_name,
            m.postal_code,
            m.email,
            m.cell_phone,
            m.home_phone,
            m.license,
            m.confirmed
        FROM members m
        LEFT JOIN regions r ON r.region_id = m.province_id
        WHERE (m.is_active = 'Y'
            AND EXISTS (SELECT user_id from member_users mu where m.member_id = mu.member_id AND mu.user_id = ${myUserId}))
            OR ((SELECT u.is_admin FROM users u where u.user_id = ${myUserId}) = 'Y');`;
    const myMembers = await MySQL.runQuery(query);
    returnResults(res, myMembers);
};
const getAnonymousMembers = async(req, res, next) => {
            const query = `SELECT
            m.member_id,
            m.first_name,
            m.middle_name,
            m.last_name,
            CONCAT (m.last_name, ', ', m.first_name) as 'name',
            m.year_of_birth,
            m.compete_gender,
            m.is_athlete,
            DATE_FORMAT(m.membership_start, '%Y-%m-%d') as 'membership_start',
            m.license
        FROM members m
        WHERE m.is_active = 'Y' AND m.confirmed = 'Y';`;
    const allMembers = await MySQL.runQuery(query);
    returnResults(res, allMembers);
};

const upsertMember = async (req, res, next) => {
    let body = req.body;
    // need to verify either: isAdmin for updates, or not anonymous for inserts of new members

    const cleanMember = getCleanBody(body, memberSchema);
    if (cleanMember.isValid) {
        let statement;
        if (cleanMember.isEdit) {
            // edits can only happen on existing records so don't worry about duplication
            statement = `UPDATE members SET ${cleanMember.setters.join(', ')} WHERE member_id = ${cleanMember.cleanBody.memberId}`;
            const statementResult = await MySQL.runCommand(statement);
            if (statementResult && statementResult.affectedRows) {
                returnSingle(res, {affectedRows: statementResult.affectedRows});
            } else {
                returnError(res, 'An error occurred when updating this record');
            }
        } else {
            // when creating a new member, first ensure there isn't already a duplicate
            const matchQuery = `select count(member_id) as 'matches' from members
            where (UPPER(first_name) = UPPER(?) AND UPPER(last_name) = UPPER(?))
            OR (UPPER(license) = UPPER('?'))`;

            const queryResult = await MySQL.runQuery(matchQuery, [cleanMember.cleanBody.firstName, cleanMember.cleanBody.lastName,
                cleanMember.cleanBody.license]);
            if (queryResult.length && queryResult[0].matches > 0) {
                return returnError(res, 'This member has already been created. Please contact the administrator to access this member.');
            }
            statement = `INSERT INTO members ${cleanMember.insertValues}`;
            const statementResult = await MySQL.runCommand(statement);

            // and also link this user to the new member
            if (statementResult.insertId){
                await MySQL.runCommand('CALL assign_member_to_user(?, ?)',
                    [req.session.user_id, statementResult.insertId]);
            }

            if (statementResult && statementResult.affectedRows) {
                returnSingle(res, {affectedRows: statementResult.affectedRows, newId: statementResult.insertId});
            } else {
                returnError(res, 'An error occurred when inserting this record');
            }
        }
    } else {
        console.log('RQ', body, cleanMember);
        returnError(res,'Member could not be updated');
    }
};


const deleteMember = async (req, res) => {
    const memberId = req.params.memberId;
    if (!memberId) {
        return returnError(res, 'A class schedule ID is required');
    }
    const statement = `DELETE FROM members WHERE member_id = ${memberId}`;
    const statementResult = await MySQL.runCommand(statement);
    if (statementResult && statementResult.affectedRows) {
        returnSingle(res, {affectedRows: statementResult.affectedRows});
    } else {
        returnError(res, 'An error occurred when deleting this record');
    }
};

const linkMembers = async(req, res) => {
    // link a member to a user
}

module.exports = {
    getMyMembers,
    getAnonymousMembers,
    upsertMember,
    deleteMember,
    linkMembers
};