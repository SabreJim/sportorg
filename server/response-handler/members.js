const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle, returnError, cleanSelected, getDateOnly } = require('../middleware/response-handler');
const { memberSchema, getCleanBody } = require('../middleware/request-sanitizer');

const getMyMembers = async(req, res, next) => {
    const myUserId = (req.session && req.session.user_id) ? req.session.user_id : -1;
    const query = `SELECT * FROM beaches.v_members m
                    WHERE (FIND_IN_SET(${myUserId} , m.user_access_id) > 0
                        OR (SELECT u.is_admin FROM beaches.users u where u.user_id = ${myUserId}) = 'Y'
                        OR EXISTS (SELECT cau.user_id FROM beaches.club_admin_users cau WHERE cau.user_id = ${myUserId} AND m.club_id = cau.club_id))`;
    const myMembers = await MySQL.runQuery(query);
    returnResults(res, myMembers);
};

// for listing members for attendance
const getMemberAttendance = async(req, res, next) => {
    const myUserId = (req.session && req.session.user_id) ? req.session.user_id : -1;
    let requestDate = getDateOnly(req.query.date);
    const query = `SELECT DISTINCT
            m.member_id,
            m.last_name,
            m.first_name,
            m.consent_signed,
            cl.club_id,
            cl.club_name,
            (CASE WHEN IFNULL(checkin.check_in_time, 0) > IFNULL(checkout.check_out_time, 0) THEN 'Y'
                ELSE 'N' END) checked_in,
            checkin.check_in_time,
            checkin.is_flagged,
            (CASE WHEN checkout.check_out_time IS NULL THEN 'N' ELSE 'Y' END) checked_out,
            checkout.check_out_time,
            (SELECT private_key FROM beaches.projects where project_name = 'beachesEast' AND private_key_id = 'checkinScreeningRequired') active_screen_required
        FROM beaches.v_members m
        LEFT JOIN (SELECT al.member_id, MAX(TIME(al.checkin_date_time)) check_in_time, COALESCE(MAX(al.is_flagged), 'N') is_flagged
            FROM beaches.attendance_log al
            WHERE DATE(al.checkin_date_time) = '${requestDate}' AND status = 'IN' 
            GROUP BY al.member_id) checkin on checkin.member_id = m.member_id
         LEFT JOIN (SELECT al.member_id, MAX(TIME(al.checkin_date_time)) 'check_out_time'
            FROM beaches.attendance_log al
            WHERE DATE(al.checkin_date_time) = '${requestDate}' AND status = 'OUT' 
            GROUP BY al.member_id) checkout on checkout.member_id = m.member_id
        LEFT JOIN beaches.clubs cl ON cl.club_id = m.club_id          
        WHERE m.is_active = 'Y' AND m.currently_enrolled = 'Y' AND
            (EXISTS (SELECT user_id from beaches.member_users mu where m.member_id = mu.member_id AND mu.user_id = ${myUserId})
            OR (SELECT u.is_admin FROM beaches.users u where u.user_id = ${myUserId}) = 'Y'
            OR EXISTS (SELECT cau.user_id FROM beaches.club_admin_users cau WHERE cau.user_id = ${myUserId} AND m.club_id = cau.club_id)
            )
        `;
    const myMembers = await MySQL.runQuery(query);
    returnResults(res, cleanSelected(myMembers, ['checkedIn', 'checkedOut', 'isFlagged', 'activeScreenRequired', 'consentSigned']));
};


const logAttendance = async(req, res) => {
    const userLog = req.body;
    let anyInvalid = 'N';
    if (!userLog.checkingOut && userLog.activeScreenRequired) {
        const userAnswers = req.body.screeningAnswers || [];
        anyInvalid = await checkAnswersAgainstQuestions(userLog.screeningAnswers, 'active-screening');
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
// check the answers to the consent questions, and update the member if they agreed to all terms
const recordConsent = async(req, res) => {
    const memberId = req.body.memberId;
    const myUserId = (req.session && req.session.user_id) ? req.session.user_id : -1;
    const userAnswers = req.body.screeningAnswers || [];
    const anyInvalid = await checkAnswersAgainstQuestions(userAnswers, 'club-consent-form');
    const consentSigned = (anyInvalid === 'Y') ? 'N' : 'Y';
    // actually log the attendance here
    const logStatement = `UPDATE beaches.members m SET m.consent_signed = '${consentSigned}'
            WHERE m.member_id = ${memberId} AND 
            (EXISTS (SELECT user_id from beaches.member_users mu where m.member_id = mu.member_id AND mu.user_id = ${myUserId})
            OR (SELECT u.is_admin FROM beaches.users u where u.user_id = ${myUserId}) = 'Y')`;

    // note that if the user is flagged once, they are flagged for the entire day
    const statementResult = await MySQL.runCommand(logStatement);
    if (statementResult.affectedRows > 0 && consentSigned === 'Y') {
        returnSingle(res, { accepted: true });
    } else {
        returnSingle(res,{ accepted: false });
    }
}

const checkAnswersAgainstQuestions = async (answers, questionGroup) => {
    let anyInvalid = 'N';
    try {
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
        WHERE q.question_group = '${questionGroup}'`;

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
        return anyInvalid;
    } catch (err) {
        return 'N';
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
    const questionGroup = req.params.questions || 'active-screening';

    const query =`SELECT 
        q.question_id,
        q.parent_question_id,
        (CASE WHEN 'EN' = 'FR' THEN fr_text ELSE en_text END) question_text,
        qa.answers
    FROM beaches.questions q
        LEFT JOIN (SELECT CONCAT('[', 
        GROUP_CONCAT(JSON_OBJECT('answerId', answer_id, 'answerText', (CASE WHEN 'EN' = 'FR' THEN fr_answer_text ELSE en_answer_text END)))
        , ']') answers, answer_group_id from beaches.question_answers GROUP BY answer_group_id) qa ON qa.answer_group_id = q.answer_group_id
    WHERE q.question_group = '${questionGroup}'`;

    const screeningQuestions = await MySQL.runQuery(query);
    let parentQuestions = cleanQuestions(screeningQuestions);
    returnResults(res, parentQuestions);
}

// for users looking up the list of club members. No authorization required and only show public information
const getAnonymousMembers = async(req, res, next) => {
    const getCompoundFilter = (filterName, query, values, tableField) => {
        let filter = '';
        if (query[filterName]) {
            let ids = [];
            values.map((v) => {
                if (query[filterName].includes(v.name)) {
                    ids.push(v.value);
                }
            });
            if (ids.length) {
                filter = `AND ${tableField} IN ('${ids.join("','")}') `;
            }
        }
        return filter;
    }
    let activeFilter = getCompoundFilter('memberTypes', req.query,
        [{name: 'isActive', value: 'Y'}, {name: 'isInactive', value: 'N'}], 'm.is_active');
    let athleteFilter = getCompoundFilter('memberTypes', req.query,
        [{name: 'isAthlete', value: 'Y'}, {name: 'isNotAthlete', value: 'N'}], 'm.is_athlete');
    let enrolledFilter = getCompoundFilter('memberTypes', req.query,
        [{name: 'enrolled', value: 'Y'}, {name: 'notEnrolled', value: 'N'}], 'm.currently_enrolled');
    let genderFilter = getCompoundFilter('gender', req.query,
        [{name: 'M', value: 'M'}, {name: 'F', value: 'F'}], 'm.compete_gender');
    let ageFilter = '';
    if (req.query.age && req.query.age.length) {
        const ageIds = req.query.age.split(',');
        ageFilter = ' AND (';
        const ageStrings = [];
        ageIds.map((ageId) => {
            ageStrings.push(`(m.compete_age >= (SELECT ac.min FROM beaches.age_categories ac where ac.age_id = ${ageId}) 
                AND m.compete_age <= (SELECT ac.max FROM beaches.age_categories ac where ac.age_id = ${ageId}))`);
        });
        if (ageStrings.length) {
            ageFilter = ` AND (${ageStrings.join(' OR ')}) `;
        }
    }
    let searchFilter = '';
    if (req.query.search && req.query.search.length) {
        searchFilter = ` AND UPPER(m.member_name) LIKE UPPER('%${req.query.search}%')`;
    }
    const searchQuery = `SELECT DISTINCT
            m.member_id,
            m.first_name,
            m.middle_name,
            m.last_name,
            m.member_name,
            m.compete_age,
            m.compete_gender,
            m.is_athlete,
            m.membership_start,
            m.license,
            m.currently_enrolled,
            m.club_abbreviation
        FROM beaches.v_members m
        WHERE 1 = 1 ${activeFilter} ${athleteFilter} ${enrolledFilter} ${genderFilter} ${ageFilter} ${searchFilter}
        ORDER BY m.member_name
        ;`;
    // TODO: server-side sorting on initial requests
    const allMembers = await MySQL.runQuery(searchQuery);
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
            const matchQuery = `select count(member_id) as 'matches' from beaches.members
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
    recordConsent,
    getScreeningQuestions,
    upsertMember,
    deleteMember
};