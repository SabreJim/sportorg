const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle, returnError } = require('../middleware/response-handler');
const { feeSchema, getCleanBody } = require('../middleware/request-sanitizer');


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

const upsertFeeStructures = async(req, res) => {
    const cleanFee = getCleanBody(req.body, feeSchema);
    if (cleanFee.isValid) {
        let statement;
        if (cleanFee.isEdit){
            statement = `UPDATE beaches.fee_structures SET ${cleanFee.setters.join(', ')} WHERE fee_id = ${cleanFee.cleanBody.feeId}`;
        } else {
            statement = `INSERT INTO beaches.fee_structures ${cleanFee.insertValues}`;
        }
        const statementResult = await MySQL.runCommand(statement);
        if (statementResult && statementResult.affectedRows) {
            returnSingle(res, {affectedRows: statementResult.affectedRows});
        } else {
            returnError(res, 'An error occurred when updating this record');
        }

    } else {
        returnError(res,'Fee could not be updated');
    }
}

const deleteFee = async (req, res) => {
    const feeId = req.params.feeId;
    if (!feeId) {
        return returnError(res, 'A member ID is required');
    }
    const statement = `DELETE FROM beaches.fee_structures WHERE fee_id = ${feeId}`;
    const statementResult = await MySQL.runCommand(statement);
    if (statementResult && statementResult.affectedRows) {
        returnSingle(res, {affectedRows: statementResult.affectedRows});
    } else {
        returnError(res, 'An error occurred when deleting this record');
    }
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
    getAppStatus,
    upsertFeeStructures,
    deleteFee
};