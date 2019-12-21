const MYSQL = require('mysql');
const R = require('ramda');
const camelcase = require('camelcase');
const fs = require('fs');

let DB = null;

const buildDBConnections = function (config) {
    // config.ssl = {
    //     ca : fs.readFileSync(__dirname + '/../../rsa/selfsigned.crt')
    // };
    DB = MYSQL.createPool(config.mysql);
    console.log(`new MySQL connection created on ${config.mysql.host} STATUS: ${DB !== null}`);
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

const runQuery = (query, params = []) => {
    let safeParams = (R.is(Array, params)) ? params : [params];
    return new Promise((resolve, reject) => {
        try {
            // const pool = MYSQL.createPool(savedConfig.mysql);
            DB.query(query, safeParams, function (error, results, fields) {
                if (error) {
                    console.log('MySQL data errors', error);
                    reject([]);
                } else {
                    resolve(cleanRows(results));
                }
            });
        } catch (dbError) {
            console.log('Error connecting to MYSQL', dbError);
            reject([]);
        }
    });
};

const runCommand = (query, params = []) => {
    let safeParams = (R.is(Array, params)) ? params : [params];
    return new Promise((resolve, reject) => {
        try {
            // const pool = MYSQL.createPool(savedConfig.mysql);
            DB.query(query, safeParams, function (error, results, fields) {
                if (error) {
                    console.log('MySQL data errors', error);
                    resolve([]);
                } else {
                    if (results.length) {
                        resolve(results[0]);
                    } else {
                        resolve(results);
                    }
                }
            });
        } catch (dbError) {
            console.log('Error connecting to MYSQL', dbError);
            reject([]);
        }
    });
};


module.exports = {
    buildDBConnections,
    runQuery,
    runCommand
};