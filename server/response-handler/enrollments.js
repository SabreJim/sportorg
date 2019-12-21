const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle, returnError } = require('../middleware/response-handler');
const { enrollmentSchema, getCleanBody } = require('../middleware/request-sanitizer');

const getMyEnrollments = async (req, res) => {
    const userId = req.session.user_id;
    const query = `select * from v_enrollments
    WHERE member_id IN (select mu.member_id from member_users mu WHERE mu.user_id = ${userId})
    OR ((SELECT u.is_admin FROM users u where u.user_id = ${userId}) = 'Y')`;
    console.log('QUERY', query);
    const myEnrollments = await MySQL.runQuery(query);
    returnResults(res, myEnrollments);
};

const enrollInClass = async (req, res, next) => {
    let body = req.body;
    body.userId = req.session.user_id;
    const cleanEnrollment = getCleanBody(body, enrollmentSchema);
    if (cleanEnrollment.isValid) {
        const enrollStatement = `select enroll_in_class(?, ?, ?) as 'message';`;
        const classArray = cleanEnrollment.cleanBody.scheduleIds;
        let addedClasses = 0;
        for (let schedule of classArray) {
            const enrollResponse = await MySQL.runCommand(enrollStatement,
                [cleanEnrollment.cleanBody.memberId, schedule, cleanEnrollment.cleanBody.userId]);
            if (enrollResponse.message && enrollResponse.message.includes('completed')){
                addedClasses = addedClasses + 1;
            }
        }
        returnSingle(res, {affectedRows: addedClasses, message: `Successfully enrolled in ${addedClasses} classes`});
    } else {
        returnError(res,'Class could not be enrolled in');
    }
};
const editEnrollment = async (req, res, next) => {

};

const deleteEnrollment = async (req, res) => {

};

module.exports = {
    getMyEnrollments,
    enrollInClass,
    editEnrollment,
    deleteEnrollment
};

