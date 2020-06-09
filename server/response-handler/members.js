const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle, returnError, cleanSelected } = require('../middleware/response-handler');
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
        WHERE m.is_active = 'Y' AND 
            (EXISTS (SELECT user_id from beaches.member_users mu where m.member_id = mu.member_id AND mu.user_id = ${myUserId})
            OR (SELECT u.is_admin FROM beaches.users u where u.user_id = ${myUserId}) = 'Y'
            OR EXISTS (SELECT cau.user_id FROM beaches.club_admin_users cau WHERE cau.user_id = ${myUserId} AND m.club_id = cau.club_id)
            )`;
    const myMembers = await MySQL.runQuery(query);
    returnResults(res, myMembers);
};

// for listing members for attendance
const getMemberAttendance = async(req, res, next) => {
    const myUserId = (req.session && req.session.user_id) ? req.session.user_id : -1;
    const query = `SELECT
            m.member_id,
            m.last_name,
            m.first_name,
            cl.club_id,
            cl.club_name,
            (CASE WHEN checkin.check_in_time IS NULL THEN 'N' ELSE 'Y' END) checked_in,
            checkin.check_in_time,
            checkin.is_flagged,
            (CASE WHEN checkout.check_out_time IS NULL THEN 'N' ELSE 'Y' END) checked_out,
            checkout.check_out_time,
            'Y' active_screen_required
        FROM beaches.members m
        LEFT JOIN (SELECT al.member_id, MAX(TIME(al.checkin_date_time)) 'check_in_time', COALESCE(MAX(al.is_flagged), 'N') is_flagged
            FROM beaches.attendance_log al
            WHERE DATE(al.checkin_date_time) = CURRENT_DATE() AND status = 'IN' 
            GROUP BY al.member_id) checkin on checkin.member_id = m.member_id
         LEFT JOIN (SELECT al.member_id, MAX(TIME(al.checkin_date_time)) 'check_out_time'
            FROM beaches.attendance_log al
            WHERE DATE(al.checkin_date_time) = CURRENT_DATE() AND status = 'OUT' 
            GROUP BY al.member_id) checkout on checkout.member_id = m.member_id
        LEFT JOIN beaches.clubs cl ON cl.club_id = m.club_id          
        WHERE m.is_active = 'Y' AND m.confirmed = 'Y' AND 
            (EXISTS (SELECT user_id from beaches.member_users mu where m.member_id = mu.member_id AND mu.user_id = ${myUserId})
            OR (SELECT u.is_admin FROM beaches.users u where u.user_id = ${myUserId}) = 'Y'
            OR EXISTS (SELECT cau.user_id FROM beaches.club_admin_users cau WHERE cau.user_id = ${myUserId} AND m.club_id = cau.club_id)
            )
        `;
    const myMembers = await MySQL.runQuery(query);
    returnResults(res, cleanSelected(myMembers, ['checkedIn', 'checkedOut', 'flagged', 'activeScreenRequired']));
};


const logAttendance = async(req, res) => {
    const userLog = req.body;
    let anyInvalid = 'N';
    if (!userLog.checkingOut && userLog.activeScreenRequired) {
        const answers = userLog.screeningAnswers || [];
        const query =`SELECT 
        q.question_id,
        q.parent_question_id,
        qa.answers,
        q.allowed_invalid,
        q.expected_answer
    FROM beaches.questions q
        LEFT JOIN (SELECT CONCAT('[', 
        GROUP_CONCAT(JSON_OBJECT('answerId', answer_id, 'answerText', (CASE WHEN 'EN' = 'FR' THEN fr_answer_text ELSE en_answer_text END)))
        , ']') answers, answer_group_id from beaches.question_answers GROUP BY answer_group_id) qa ON qa.answer_group_id = q.answer_group_id
    WHERE q.question_group = 'active-screening'`;

        // check each answer from the user against the expected answers
        let questions = await MySQL.runQuery(query);
        questions = cleanQuestions(questions);
        questions.map((q) => {
            const userAnswer = answers.find(item => item.questionId === q.questionId);
           if (q.expectedAnswer && q.expectedAnswer !== userAnswer.answerId) {
               anyInvalid = 'Y';
           }
           if (q.childQuestions && q.childQuestions.length) {
               let countChildInvalid = 0;
               q.childQuestions.map((childQ) => {
                   const userChildAnswer = answers.find(item => item.questionId === childQ.questionId);
                  if (childQ.expectedAnswer && childQ.expectedAnswer !== userChildAnswer.answerId) {
                      countChildInvalid = countChildInvalid + 1;
                  }
               });
               // child questions may have an "allowance" for how many can be invalid
               if (countChildInvalid > q.allowedInvalid) {
                   anyInvalid = 'Y';
               }
           }
        });
    }
    // actually log the attendance here
    const logStatement = `INSERT INTO beaches.attendance_log 
        (member_id, checkin_date_time, checkin_by, is_flagged, status)
        VALUES (${userLog.memberId}, NOW(), '${req.session.user_id}', '${anyInvalid}', '${(userLog.checkingOut) ? 'OUT' : 'IN'}')`;

    // note that if the user is flagged once, they are flagged for the entire day
    const statementResult = await MySQL.runCommand(logStatement);
    if (statementResult.insertId) {
        returnSingle(res, {flagged: anyInvalid === 'Y'});
    } else {
        returnError(res, 'Check in could not be completed');
    }
}

const cleanQuestions = (screeningQuestions) => {
    let parentQuestions = [];
    let childQuestions = [];
    screeningQuestions.map((question) => {
        question.answers = JSON.parse(question.answers);
        if (!question.parentQuestionId)  {
            parentQuestions.push(question);
        } else {
            childQuestions.push(question);
        }
    });
    parentQuestions = parentQuestions.map((parent) => {
        parent.childQuestions = childQuestions.filter((item) => item.parentQuestionId === parent.questionId);
        return parent;
    });
    return parentQuestions;
}

const getScreeningQuestions = async (req, res) => {
    const query =`SELECT 
        q.question_id,
        q.parent_question_id,
        (CASE WHEN 'EN' = 'FR' THEN fr_text ELSE en_text END) question_text,
        qa.answers
    FROM beaches.questions q
        LEFT JOIN (SELECT CONCAT('[', 
        GROUP_CONCAT(JSON_OBJECT('answerId', answer_id, 'answerText', (CASE WHEN 'EN' = 'FR' THEN fr_answer_text ELSE en_answer_text END)))
        , ']') answers, answer_group_id from beaches.question_answers GROUP BY answer_group_id) qa ON qa.answer_group_id = q.answer_group_id
    WHERE q.question_group = 'active-screening'`;

    const screeningQuestions = await MySQL.runQuery(query);
    let parentQuestions = cleanQuestions(screeningQuestions);
    returnResults(res, parentQuestions);
}

// for users looking up the list of club members. No authorization required and only show public information
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
            OR (UPPER(license) = UPPER(?))`;

            const queryResult = await MySQL.runQuery(matchQuery, [cleanMember.cleanBody.firstName, cleanMember.cleanBody.lastName,
                cleanMember.cleanBody.license]);
            if (queryResult.length && queryResult[0].matches > 0) {
                return returnError(res, 'This member has already been created. Please contact the administrator to access this member.');
            }
            statement = `INSERT INTO beaches.members ${cleanMember.insertValues}`;
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
        returnError(res,'Member could not be updated');
    }
};


const deleteMember = async (req, res) => {
    const memberId = req.params.memberId;
    if (!memberId) {
        return returnError(res, 'A member ID is required');
    }
    const statement = `DELETE FROM members WHERE member_id = ${memberId}`;
    const statementResult = await MySQL.runCommand(statement);
    if (statementResult && statementResult.affectedRows) {
        returnSingle(res, {affectedRows: statementResult.affectedRows});
    } else {
        returnError(res, 'An error occurred when deleting this record');
    }
};

module.exports = {
    getMyMembers,
    getAnonymousMembers,
    getMemberAttendance,
    logAttendance,
    getScreeningQuestions,
    upsertMember,
    deleteMember
};