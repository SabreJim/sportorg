const MySQL = require('../middleware/mysql-service');
const { returnResults } = require('../middleware/response-handler');


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

const getMenus = async (req, res, next) => {
    const query = 'SELECT * from menus ORDER BY order_number';
    const menus = await MySQL.runQuery(query);
    returnResults(res, menus);
}
module.exports = {
    getFeeStructures,
    getLookupValues,
    getMenus
};