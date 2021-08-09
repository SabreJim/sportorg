const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle, returnError } = require('../middleware/response-handler');
const { classScheduleSchema, seasonSchema, getCleanBody } = require('../middleware/request-sanitizer');
const currentSeasonString = `(select private_key from projects where type = 'config' and private_key_id = 'currentSeason')`;

const getClass = async (req, res) => {

};
const getAllClasses = async(req, res, next) => {
    const query = `SELECT * from v_classes ORDER BY season_id DESC, program_id`;
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
        const statementResult = await MySQL.runCommand(statement);
        if (statementResult && statementResult.affectedRows) {
            returnSingle(res, {affectedRows: statementResult.affectedRows});
        } else {
            returnError(res, 'An error occurred when updating this record');
        }
    } else {
        returnError(res,'Class could not be updated');
    }
};

const deleteClass = async (req, res) => {
    const scheduleId = req.params.scheduleId;
    if (!scheduleId) {
        return returnError(res, 'A class schedule ID is required');
    }
    const statement = `DELETE FROM program_schedules WHERE schedule_id = ${scheduleId}`;
    const statementResult = await MySQL.runCommand(statement);
    if (statementResult && statementResult.affectedRows) {
        returnSingle(res, {affectedRows: statementResult.affectedRows});
    } else {
        returnError(res, 'An error occurred when deleting this record');
    }
};

const getSeasons = async(req, res, next) => {
    const query = `SELECT * from beaches.seasons ORDER BY season_id`;
    const seasons = await MySQL.runQuery(query);
    returnResults(res, seasons);
};
const upsertSeason = async (req, res, next) => {
    let body = req.body;
    const cleanSeason = getCleanBody(body, seasonSchema);
    if (cleanSeason.isValid) {
        let statement;
        if (cleanSeason.isEdit){
            statement = `UPDATE beaches.seasons SET ${cleanSeason.setters.join(', ')} WHERE season_id = ${cleanSeason.cleanBody.seasonId}`;
        } else {
            statement = `INSERT INTO beaches.seasons ${cleanSeason.insertValues}`;
        }
        const statementResult = await MySQL.runCommand(statement);
        if (statementResult && statementResult.affectedRows) {
            returnSingle(res, {affectedRows: statementResult.affectedRows});
        } else {
            returnError(res, 'An error occurred when updating this record');
        }
    } else {
        returnError(res,'Season could not be updated');
    }
};

module.exports = {
    getClass,
    getAllClasses,
    upsertClass,
    deleteClass,
    getSeasons,
    upsertSeason
};