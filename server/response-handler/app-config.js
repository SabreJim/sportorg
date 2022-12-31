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
    const updatePromises = body.map(async (row) => {
        const statement = `UPDATE beaches.projects SET private_key = '${row.value}' WHERE private_key_id = '${row.configItem}';`;
        await MySQL.runCommand(statement);
    });
    await Promise.all(updatePromises);
    returnSingle(res, {});
};

module.exports = {
    getAppConfigs,
    updateAppConfigs
};