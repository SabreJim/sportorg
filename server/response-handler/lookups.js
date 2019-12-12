const MySQL = require('../middleware/mysql-service');
const Auth = require('../middleware/server-authentication');
const { returnResults } = require('../middleware/response-handler');
const currentSeasonString = `(select private_key from projects where type = 'config' and private_key_id = 'currentSeason')`;

const getProgramsBySeason = async(req, res, next) => {
    const requestedSeason = req.params.seasonId;
    let whereClause = (requestedSeason === parseInt(requestedSeason)) ? ` ${requestedSeason}` : currentSeasonString;
    const query = `SELECT * from v_programs WHERE season_id = ${whereClause} ORDER BY level_id`;
    console.log('query', query);
    const programs = await MySQL.runQuery(query);
    returnResults(res, programs);
};

const getFeeStructures = async(req, res, next) => {
    const query = `SELECT * from fee_structures order by fee_id`;
    const fees = await MySQL.runQuery(query);
    returnResults(res, fees);
};

const getLookupValues = async(req, res, next) => {
    const query = `SELECT * from v_lookups order by lookup`;
    const lookups = await MySQL.runQuery(query);
    returnResults(res, lookups);
};

module.exports = {
    getFeeStructures,
    getProgramsBySeason,
    getLookupValues
};