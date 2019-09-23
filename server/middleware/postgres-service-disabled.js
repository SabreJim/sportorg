const { Pool } = require('pg');
const R = require('ramda');
const camelcase = require('camelcase');

let DB = null;

const buildDBConnections = function (config) {
    DB = new Pool(config.postgres);
    console.log(`new DB created on ${config.postgres.host} STATUS: ${DB !== null}`);
};

const cleanRows = (rows) => {
    return R.map((row) => {
        const camelObj = {};
        R.mapObjIndexed((val, key) => {
            camelObj[camelcase(key)] = val;
        }, row);
        return camelObj;
    }, rows);
};

const runQuery = async (query, params = []) => {
    const conn = await DB.connect();
    let safeParams = (R.is(Array, params)) ? params : [params];
    try {
        const result = await conn.query(query, safeParams);
        // console.log('PG Query:', query, params, result.rows[0]);
        return cleanRows(result.rows);
    } catch (dbError) {
        console.log('Error at Data level', dbError);
        return  [] ;
    } finally {
        // console.log('releasing connection');
        conn.release();
    }
};


module.exports = {
    buildDBConnections,
    runQuery
};