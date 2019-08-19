const Postgres = require('../middleware/postgres-service');
const { returnResults } = require('../middleware/response-handler');

const getActiveSeasons = async(req, res, next) => {
    const query = `
        SELECT * from seasons s
            WHERE EXISTS (select * from programs p where p.season_id = s.season_id) `;
    const seasons = await Postgres.runQuery(query);
    returnResults(res, seasons);
};

const getProgramDetails = async (req, res, next) => {
    const programs = await Postgres.runQuery('SELECT * FROM programs_levels');
    returnResults(res, programs);
};

const getProgramsBySeason = async(req, res, next) => {
    const requestedSeason = req.params.seasonId || -1 ;
    const query = `
        SELECT * from v_programs
        WHERE season_id = $1  OR ($1 = -1 AND season_id = 1)
        ORDER BY level_id`;
    const programs = await Postgres.runQuery(query, [requestedSeason]);
    returnResults(res, programs);
};

const getFeeStructures = async(req, res, next) => {
    const query = `SELECT * from fee_structures order by fee_id`;
    const fees = await Postgres.runQuery(query);
    returnResults(res, fees);
};

module.exports = {
    getActiveSeasons,
    getProgramDetails,
    getFeeStructures,
    getProgramsBySeason
};