const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle, returnError } = require('../middleware/response-handler');
const { programSchema, getCleanBody } = require('../middleware/request-sanitizer');

const getAllPrograms = async(req, res, next) => {
    const query = `SELECT * from v_programs ORDER BY is_active DESC, program_id`;
    const programs = await MySQL.runQuery(query);
    returnResults(res, programs);
};
const getActivePrograms = async(req, res, next) => {
    const query = `SELECT * from v_programs WHERE is_active = 'Y' ORDER BY program_id`;
    const programs = await MySQL.runQuery(query);
    returnResults(res, programs);
};

const upsertProgram = async (req, res, next) => {
    let body = req.body;
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


const deleteProgram = async (req, res) => {
    const programId = req.params.programId;
    if (!programId) {
        return returnError(res, 'A class schedule ID is required');
    }
    const statement = `DELETE FROM programs WHERE program_id = ${programId}`;
    const statementResult = await MySQL.runCommand(statement);
    if (statementResult && statementResult.affectedRows) {
        returnSingle(res, {affectedRows: statementResult.affectedRows});
    } else {
        returnError(res, 'An error occurred when deleting this record');
    }
};

module.exports = {
    getAllPrograms,
    getActivePrograms,
    upsertProgram,
    deleteProgram
};