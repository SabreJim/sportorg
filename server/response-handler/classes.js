const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle, returnError } = require('../middleware/response-handler');
const { classScheduleSchema, getCleanBody } = require('../middleware/request-sanitizer');
const currentSeasonString = `(select private_key from projects where type = 'config' and private_key_id = 'currentSeason')`;

const getClass = async (ctx, req, res) => {

};
const getAllClasses = async(req, res, next) => {
    let seasonId = req.query.seasonId;
    let whereClause = ` WHERE season_id = ${currentSeasonString}`;
    try {
        seasonId = parseInt(seasonId);
        if (seasonId === -1) {
            whereClause = '';
        } else if (!isNaN(seasonId)) {
            whereClause = ` WHERE season_id = ${seasonId} `;
        }
    } catch (err) {
        // not a valid id so use default
    }
    const query = `SELECT * from v_classes ${whereClause} ORDER BY season_id, program_id`;
    const programs = await MySQL.runQuery(query);
    returnResults(res, programs);
};


const upsertClass = async (req, res, next) => {
    let body = req.body;
    const cleanClass = getCleanBody(body, classScheduleSchema);
    if (cleanClass.isValid) {
        let statement;
        if (cleanClass.isEdit){
            statement = `UPDATE program_schedules SET ${cleanClass.setters.join(', ')} WHERE schedule_id = ${cleanClass.cleanBody.scheduleId}`;
        } else {
            statement = `INSERT INTO program_schedules ${cleanClass.insertValues}`;
        }
        console.log('query to run', statement);
        const statementResult = await MySQL.runCommand(statement);
        console.log('did run?', statementResult);
        if (statementResult && statementResult.affectedRows) {
            returnSingle(res, {affectedRows: statementResult.affectedRows});
        } else {
            returnError(res, 'An error occurred when updating this record');
        }

    } else {
        returnError(res,'Class could not be updated');
    }

};


const deleteClass = async (ctx, req, res) => {

};

module.exports = {
    getClass,
    getAllClasses,
    upsertClass,
    deleteClass
};