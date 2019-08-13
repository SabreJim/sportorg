const Entity = require('../data-access/dynamo-entity-helper');
const DB = require('../middleware/postgres-service');
const R = require('ramda');

const getClass = async (ctx, req, res) => {

};

// build a query for classes where (year, season, minAge, maxAge, dayOfWeek, level) can be searched
const buildQuery = (request) => {
    let query = Entity.parseItem(request, 'year', 'N', ':y', '=', null);
    query = Entity.parseItem(request, 'season', 'S', ':s', '=', query);
    query = Entity.parseItem(request, 'minAge', 'N', ':minA', 'GE', query);
    query = Entity.parseItem(request, 'maxAge', 'N', ':maxA', 'LE', query);
    query = Entity.parseItem(request, 'dayOfWeek', 'S', ':d', '=', query);
    query = Entity.parseItem(request, 'level', 'S', ':l', '=', query);
    return query;
};

const searchClasses = async (ctx, req, res, next) => {
    console.log('query', req.query);
    let pgQ = await DB.runQuery('select * from class_levels');
    console.log('PG WORKS?', pgQ);
    res.json(pgQ);

    // // 'season' is the partition key and MUST be included in any search
    // if (R.has('season', req.query)) {
    //     const query = buildQuery(req.query);
    //     Entity.searchEntity(ctx, res, 'Classes', query).then((result) => {
    //         console.log('RESPONSE in class', result);
    //         res.json(result);
    //     });
    //
    //
    // } else {
    //     Entity.getAllEntities(ctx, 'Classes').then((result) => {
    //         console.log('SCANN back', result);
    //         res.json(result);
    //     });
    //
    // }
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
    searchClasses,
    addClass,
    updateClass,
    deleteClass
};