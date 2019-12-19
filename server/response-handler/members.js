const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle, returnError } = require('../middleware/response-handler');
const { programSchema, getCleanBody } = require('../middleware/request-sanitizer');

const getMyMembers = async(req, res, next) => {
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
            m.membership_start,
            m.home_address,
            m.email,
            m.cell_phone,
            m.home_phone,
            m.license,
            m.confirmed
        FROM members m
        WHERE (m.is_active = 'Y'
            AND EXISTS (SELECT user_id from member_users mu where m.member_id = mu.member_id AND mu.user_id = 1))
            OR ((SELECT u.is_admin FROM users u where u.user_id = 1) = 'Y');`;
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
            m.membership_start,
            m.license
        FROM members m
        WHERE m.is_active = 'Y' AND m.confirmed = 'Y';`;
    const allMembers = await MySQL.runQuery(query);
    returnResults(res, allMembers);
};

const upsertMember = async (req, res, next) => {
    let body = req.body;
    // need to verify either: isAdmin for updates, or not anonymous for inserts of new members

    const cleanProgram = getCleanBody(body, programSchema);
    if (cleanProgram.isValid) {
        let statement;
        if (cleanProgram.isEdit){
            statement = `UPDATE programs SET ${cleanProgram.setters.join(', ')} WHERE program_id = ${cleanProgram.cleanBody.programId}`;
        } else {
            statement = `INSERT INTO program_schedules ${cleanProgram.insertValues}`;
        }
        console.log('query to run', statement);
        const statementResult = await MySQL.runCommand(statement);
        if (statementResult && statementResult.affectedRows) {
            returnSingle(res, {affectedRows: statementResult.affectedRows});
        } else {
            returnError(res, 'An error occurred when updating this record');
        }

    } else {
        console.log('RQ', body, cleanProgram);
        returnError(res,'Program could not be updated');
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