const Entity = require('../data-access/dynamo-entity-helper');
const DB = require('../middleware/postgres-service');
const Postgres = require('../middleware/postgres-service');
const { returnResults } = require('../middleware/response-handler');

const R = require('ramda');

const getClass = async (ctx, req, res) => {

};

const getAllClasses = async(req, res, next) => {
    const requestedSeason = req.query.seasonId || 1 ;
    const query = 'SELECT * FROM v_program_schedules where season_id = $1';
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