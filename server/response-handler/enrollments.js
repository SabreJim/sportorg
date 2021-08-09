const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle, returnError } = require('../middleware/response-handler');
const { enrollmentSchema, getCleanBody } = require('../middleware/request-sanitizer');

const getMyEnrollments = async (req, res) => {
    const userId = req.session.user_id;
    const query = `select * from v_enrollments
    WHERE member_id IN (select mu.member_id from member_users mu WHERE mu.user_id = ${userId})
    OR ((SELECT u.is_admin FROM users u where u.user_id = ${userId}) = 'Y')`;
    const myEnrollments = await MySQL.runQuery(query);
    returnResults(res, myEnrollments);
};

const enrollInClass = async (req, res, next) => {
    let body = req.body;
    body.userId = req.session.user_id;
    const cleanEnrollment = getCleanBody(body, enrollmentSchema);
    if (cleanEnrollment.isValid) {
        const memberId = cleanEnrollment.cleanBody.memberId || -1;
        const programId = cleanEnrollment.cleanBody.programId || -1;
        const seasonId = cleanEnrollment.cleanBody.seasonId || -1;
        let statement = 'SELECT beaches.enroll_in_program(?, ?, ?, ?) as rowsAffected';
        const rowsAffected = await MySQL.runCommand(statement, [memberId, programId, seasonId, body.userId]);
        if (rowsAffected) {
            returnSingle(res, {affectedRows: rowsAffected, message: `Successfully enrolled in program`});
        } else {
            returnError(res, 'Program could not be enrolled in');
        }
    } else {
        returnError(res,'Program could not be enrolled in');
    }
};
const editEnrollment = async (req, res, next) => {

};

const deleteEnrollment = async (req, res) => {

};
// show the list of enrollments for members you can see
const getMyMemberEnrollments = async(req, res, next) => {
    const myUserId = (req.session && req.session.user_id) ? req.session.user_id : -1;
    const query = `SELECT
            ce.enroll_id,
            m.member_id,
            CONCAT(m.first_name, ' ', m.last_name) member_name,
            ce.program_id,
            p.program_name,
            ce.season_id,
            CONCAT(s.name, ' ', s.year) season_name,
            CONCAT('$',fs.fee_value) program_fees,
            DATE_FORMAT(s.start_date, '%Y-%m-%d') start_date,
            DATE_FORMAT(s.end_date, '%Y-%m-%d') end_date
        FROM beaches.members m
        INNER JOIN beaches.class_enrollments ce ON ce.member_id = m.member_id
        INNER JOIN beaches.programs p ON p.program_id = ce.program_id
        INNER JOIN beaches.fee_structures fs ON fs.fee_id = p.fee_id
        INNER JOIN beaches.seasons s ON s.season_id = ce.season_id
        WHERE m.is_athlete = 'Y' AND 
            (EXISTS (SELECT user_id from beaches.member_users mu where m.member_id = mu.member_id AND mu.user_id = ${myUserId})
            OR (SELECT u.is_admin FROM beaches.users u where u.user_id = ${myUserId}) = 'Y'
            OR EXISTS (SELECT cau.user_id FROM beaches.club_admin_users cau WHERE cau.user_id = ${myUserId} AND m.club_id = cau.club_id)
            )`;
    const myMembers = await MySQL.runQuery(query);
    returnResults(res, myMembers);
};
// show members as enrolled or not in the selected season
const getMyMembersEnrolled = async(req, res, next) => {
    const myUserId = (req.session && req.session.user_id) ? req.session.user_id : -1;
    const seasonId = req.params.seasonId || -1;
    const query = `SELECT
             m.member_id,
            m.first_name,
            m.last_name,
            m.year_of_birth,
            m.compete_gender,
            m.is_active,
            m.is_athlete,
            m.email,
            m.license,
            m.is_loyalty_member,
            (CASE WHEN 
            (SELECT count(1) FROM beaches.class_enrollments where member_id = m.member_id and season_id = ${seasonId})
             > 0 THEN 'Y' 
                ELSE 'N' END) is_enrolled
        FROM beaches.members m
        WHERE m.is_athlete = 'Y' AND 
            (EXISTS (SELECT user_id from beaches.member_users mu where m.member_id = mu.member_id AND mu.user_id = ${myUserId})
            OR (SELECT u.is_admin FROM beaches.users u where u.user_id = ${myUserId}) = 'Y'
            OR EXISTS (SELECT cau.user_id FROM beaches.club_admin_users cau WHERE cau.user_id = ${myUserId} AND m.club_id = cau.club_id)
            )`;
    const myMembers = await MySQL.runQuery(query);
    returnResults(res, myMembers);
};

module.exports = {
    getMyEnrollments,
    getMyMemberEnrollments,
    getMyMembersEnrolled,
    enrollInClass,
    editEnrollment,
    deleteEnrollment
};

