const MySQL = require('../middleware/mysql-service');
const Auth = require('../middleware/server-authentication');
const { returnResults } = require('../middleware/response-handler');

const getActiveSeasons = async(req, res, next) => {
    const query = `
        SELECT * from seasons s
            WHERE EXISTS (select * from programs p where p.season_id = s.season_id) `;
    const seasons = await MySQL.runQuery(query);
    returnResults(res, seasons);
};

const getProgramDetails = async (req, res, next) => {
    const programs = await MySQL.runQuery('SELECT * FROM programs_levels');
    returnResults(res, programs);
};

const getProgramsBySeason = async(req, res, next) => {
    const requestedSeason = req.params.seasonId || -1 ;
    const query = `
        SELECT * from v_programs
        WHERE season_id = ?  OR (? = -1 AND season_id = 1)
        ORDER BY level_id`;
    const programs = await MySQL.runQuery(query, [requestedSeason, requestedSeason]);
    returnResults(res, programs);
};

const getAllClasses = async(req, res, next) => {
    const query = `SELECT * from v_classes ORDER BY season_id, program_id`;
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
    getActiveSeasons,
    getProgramDetails,
    getFeeStructures,
    getProgramsBySeason,
    getAllClasses,
    getLookupValues
};