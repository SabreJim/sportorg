const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle, returnError } = require('../middleware/response-handler');
const { getCleanBody } = require('../middleware/request-sanitizer');

// show members as enrolled or not in the selected season
const getAppConfigs = async(req, res, next) => {
    const query = `SELECT DISTINCT private_key_id config_item, private_key value FROM beaches.projects WHERE type = 'config'`;
    const allConfigs = await MySQL.runQuery(query);
    returnResults(res, allConfigs);
};

const updateAppConfigs = async (req, res, next) => {
    let body = req.body;
    returnSingle(res, {});
    // let statement = `UPDATE beaches.projects SET ${cleanProgram.setters.join(', ')} WHERE program_id = ${cleanProgram.cleanBody.programId}`;
    // const statementResult = await MySQL.runCommand(statement);
    // if (statementResult && statementResult.affectedRows) {
    //     returnSingle(res, {affectedRows: statementResult.affectedRows});
    // } else {
    //     returnError(res, 'An error occurred when updating this record');
    // }
};

module.exports = {
    getAppConfigs,
    updateAppConfigs
};