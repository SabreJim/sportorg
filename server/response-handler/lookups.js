const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle } = require('../middleware/response-handler');


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
    const query = `SELECT 
            m.menu_id,
            m.title,
            m.link,
            m.mobile_only,
            m.parent_menu_id,
            m.alt_title,
            m.order_number,
            CONCAT('[', (SELECT GROUP_CONCAT(
                JSON_OBJECT('menuId', mc.menu_id, 'title', mc.title, 'link', mc.link, 'orderNumber', mc.order_number)) 
                    FROM beaches.menus mc WHERE mc.parent_menu_id = m.menu_id), ']') as child_menus
        FROM beaches.menus m
        WHERE parent_menu_id IS NULL ORDER BY m.order_number`;

    let menus = await MySQL.runQuery(query);
    menus = menus.map((row) => {
        if (row.childMenus) {
            try {
                row.childMenus = JSON.parse(row.childMenus);
            } catch (err) { row.childMenus = [];}
        }
        else row.childMenus = [];
        return row;
    });


    returnResults(res, menus);
}

const getAppStatus = async (req, res, next) => {
    const query = `SELECT * from beaches.app_status WHERE banner_active = 'Y'`;
    const status = await MySQL.runQuery(query);
    returnResults(res, status || []);
}
module.exports = {
    getFeeStructures,
    getLookupValues,
    getMenus,
    getAppStatus
};