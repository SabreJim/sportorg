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

module.exports = {
    getActiveSeasons,
    getProgramDetails
};