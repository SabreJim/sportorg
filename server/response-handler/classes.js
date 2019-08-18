const Entity = require('../data-access/dynamo-entity-helper');
const DB = require('../middleware/postgres-service');
const Postgres = require('../middleware/postgres-service');
const { returnResults } = require('../middleware/response-handler');

const R = require('ramda');

const getClass = async (ctx, req, res) => {

};

const getAllClasses = async(req, res, next) => {
    const requestedSeason = req.query.seasonId || -1 ;
    // if no season is specified, get the current season

    const query = `
        SELECT * from v_program_schedules
        WHERE season_id = $1 
        OR ($1 = -1 AND start_date <= current_date AND end_date > current_date)
        OR season_id = 1`;
    const classes = await Postgres.runQuery(query, [requestedSeason]);
    returnResults(res, classes);
};


const addClass = async (ctx, req, res) => {
    let body = req.body;
    if (R.has('season', body) && R.has('program', body)){
        await Entity.addEntity(ctx, 'Classes', body);
        res.send(body);
    } else {
        res.send(' season and program are required');
    }
};

const updateClass = async (ctx, req, res) => {

};

const deleteClass = async (ctx, req, res) => {

};

module.exports = {
    getClass,
    getAllClasses,
    addClass,
    updateClass,
    deleteClass
};