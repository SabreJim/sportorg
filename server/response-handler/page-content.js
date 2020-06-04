const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle, returnError, parseHtmlFields } = require('../middleware/response-handler');
const { pageSchema, menuSchema, bannerSchema, tipSchema, getCleanBody } = require('../middleware/request-sanitizer');

// get the contents of a page that is stored in the DB
const getPage = async (req, res) => {
    let pageName = req.params.pageName || '-1';
    if (pageName === '-1') return returnSingle(res, { pageId: -1});

    const query = `SELECT * FROM beaches.page_content WHERE UPPER(page_name) = UPPER('${pageName}')`;
    let queryResponse = await MySQL.runQuery(query);
    if (queryResponse && queryResponse.length) {
        queryResponse = parseHtmlFields(queryResponse[0], ['htmlContent']);
        returnSingle(res, queryResponse);
    } else {
        returnSingle(res, { pageId: -1 });
    }
}
const getAllPages = async (req, res) => {
    const query = `SELECT * FROM beaches.page_content`;
    let queryResponse = await MySQL.runQuery(query);
    if (queryResponse && queryResponse.length) {
        queryResponse = parseHtmlFields(queryResponse, ['htmlContent']);
        returnResults(res, queryResponse);
    } else {
        returnResults(res, []);
    }
}

const upsertPage = async(req, res, next) => {
    const cleanPage = getCleanBody(req.body, pageSchema);
    if (cleanPage.isValid) {
        let statement;
        let statementResult;
        if (cleanPage.isEdit){
            statement = `UPDATE beaches.page_content SET ${cleanPage.setters.join(', ')} WHERE page_id = ${cleanPage.cleanBody.pageId}`;
            statementResult = await MySQL.runCommand(statement);
            if (statementResult && statementResult.affectedRows) {
                return returnSingle(res, {affectedRows: statementResult.affectedRows});
            }
        } else {
            statement = `INSERT INTO beaches.page_content ${cleanPage.insertValues}`;
            statementResult = await MySQL.runCommand(statement);
            return returnSingle(res, {affectedRows: statementResult.affectedRows});
        }
        return returnError(res, 'An error occurred when updating this record');
    } else {
        returnError(res,'Page could not be updated');
    }
};

const deletePage = async (req, res) => {
    const pageId = req.params.pageId || -1;
    let statement = `DELETE FROM beaches.page_content WHERE  page_id = ${pageId} `;
    let statementResult = await MySQL.runCommand(statement);
    if (statementResult && statementResult.affectedRows) {
        returnSingle(res, {affectedRows: statementResult.affectedRows});
    } else {
        returnSingle(res, 'Not able to delete this page');
    }
};

// admin endpoints for changing the menu

const getMenuAdmin = async (req, res) => {
    const query = `SELECT * FROM beaches.menus`;
    let queryResponse = await MySQL.runQuery(query);
    if (queryResponse && queryResponse.length) {
        returnResults(res, queryResponse);
    } else {
        returnResults(res, []);
    }
}

const upsertMenu = async(req, res, next) => {
    console.log('link before clean', req.body.link);
    req.body.link = req.body.link.trim();
    if (req.body.link.indexOf('/') !== 0) {
        req.body.link = `/${req.body.link}`;
    }
    const cleanMenu = getCleanBody(req.body, menuSchema);
    if (cleanMenu.isValid) {
        let statement;
        let statementResult;
        if (cleanMenu.isEdit) {
            statement = `UPDATE beaches.menus SET ${cleanMenu.setters.join(', ')} WHERE menu_id = ${cleanMenu.cleanBody.menuId}`;
            statementResult = await MySQL.runCommand(statement);
            if (statementResult && statementResult.affectedRows) {
                return returnSingle(res, {affectedRows: statementResult.affectedRows});
            }
        } else {
            statement = `INSERT INTO beaches.menus ${cleanMenu.insertValues}`;
            statementResult = await MySQL.runCommand(statement);
            return returnSingle(res, {affectedRows: statementResult.affectedRows});
        }
        return returnError(res, 'An error occurred when updating this record');
    } else {
        returnError(res,'Menu could not be updated');
    }
};

const deleteMenu = async (req, res) => {
    const pageId = req.params.menuId || -1;
    let statement = `DELETE FROM beaches.menus WHERE  menu_id = ${pageId} `;
    let statementResult = await MySQL.runCommand(statement);
    if (statementResult && statementResult.affectedRows) {
        returnSingle(res, {affectedRows: statementResult.affectedRows});
    } else {
        returnSingle(res, 'Not able to delete this menu');
    }
};

////////////////////////////////////////////////////
// Banners admin endpoints
///////////////////////////////////////////////////
const getAllBanners = async (req, res) => {
    const query = `SELECT * FROM beaches.app_status`;
    let queryResponse = await MySQL.runQuery(query);
    if (queryResponse && queryResponse.length) {
        returnResults(res, queryResponse);
    } else {
        returnResults(res, []);
    }
}

const upsertBanner = async(req, res, next) => {
    const cleanBanner = getCleanBody(req.body, bannerSchema);
    if (cleanBanner.isValid) {
        let statement;
        let statementResult;
        if (cleanBanner.isEdit) {
            statement = `UPDATE beaches.app_status SET ${cleanBanner.setters.join(', ')} WHERE status_id = ${cleanBanner.cleanBody.statusId}`;
            statementResult = await MySQL.runCommand(statement);
            if (statementResult && statementResult.affectedRows) {
                return returnSingle(res, {affectedRows: statementResult.affectedRows});
            }
        } else {
            statement = `INSERT INTO beaches.app_status ${cleanBanner.insertValues}`;
            statementResult = await MySQL.runCommand(statement);
            return returnSingle(res, {affectedRows: statementResult.affectedRows});
        }
        return returnError(res, 'An error occurred when updating this record');
    } else {
        returnError(res,'Banner could not be updated');
    }
};

const deleteBanner = async (req, res) => {
    const statusId = req.params.statusId || -1;
    let statement = `DELETE FROM beaches.app_status WHERE  status_id = ${statusId} `;
    let statementResult = await MySQL.runCommand(statement);
    if (statementResult && statementResult.affectedRows) {
        returnSingle(res, {affectedRows: statementResult.affectedRows});
    } else {
        returnSingle(res, 'Not able to delete this Banner');
    }
};

////////////////////////////////////////////////////
// Tooltip admin endpoints
///////////////////////////////////////////////////
const getToolTip = async (req, res) => {
    let tipName = req.params.tipName || '-1';
    if (tipName === '-1') return returnSingle(res, {tipId: -1});
    let lang = req.query.lang || 'EN';

    const query = `SELECT 
            tt.tip_id,
            tt.tip_name,
            (CASE WHEN 'FR' = '${lang}' THEN tt.fr_title ELSE en_title END) title,
            (CASE WHEN 'FR' = '${lang}' THEN tt.fr_text ELSE en_text END) text,
            UPPER('${lang}') language
        FROM beaches.tool_tips tt
        WHERE UPPER(tip_name) = UPPER('${tipName}')`;

    let queryResponse = await MySQL.runQuery(query);
    if (queryResponse && queryResponse.length) {
        queryResponse = parseHtmlFields(queryResponse[0], ['text']);
        returnSingle(res, queryResponse);
    } else {
        returnSingle(res, {tipId: -1});
    }
}
const getAllToolTips = async (req, res) => {
    const query = `SELECT * FROM beaches.tool_tips`;
    let queryResponse = await MySQL.runQuery(query);
    if (queryResponse && queryResponse.length) {
        queryResponse = parseHtmlFields(queryResponse, ['text']);
        returnResults(res, queryResponse);
    } else {
        returnResults(res, []);
    }
}

const upsertToolTip = async(req, res, next) => {
    const cleanTip = getCleanBody(req.body, tipSchema);
    if (cleanTip.isValid) {
        let statement;
        let statementResult;
        if (cleanTip.isEdit){
            statement = `UPDATE beaches.tool_tips SET ${cleanTip.setters.join(', ')} WHERE tip_id = ${cleanTip.cleanBody.tipId}`;
            statementResult = await MySQL.runCommand(statement);
            if (statementResult && statementResult.affectedRows) {
                return returnSingle(res, {affectedRows: statementResult.affectedRows});
            }
        } else {
            statement = `INSERT INTO beaches.tool_tips ${cleanTip.insertValues}`;
            statementResult = await MySQL.runCommand(statement);
            return returnSingle(res, {affectedRows: statementResult.affectedRows});
        }
        return returnError(res, 'An error occurred when updating this record');
    } else {
        returnError(res,'ToolTip could not be updated');
    }
};

const deleteToolTip = async (req, res) => {
    const tipId = req.params.tipId || -1;
    let statement = `DELETE FROM beaches.tool_tips WHERE  tip_id = ${tipId} `;
    let statementResult = await MySQL.runCommand(statement);
    if (statementResult && statementResult.affectedRows) {
        returnSingle(res, {affectedRows: statementResult.affectedRows});
    } else {
        returnSingle(res, 'Not able to delete this toolTip');
    }
};

module.exports = {
    getPage,
    getAllPages,
    upsertPage,
    deletePage,
    getMenuAdmin,
    upsertMenu,
    deleteMenu,
    getAllBanners,
    upsertBanner,
    deleteBanner,
    getToolTip,
    getAllToolTips,
    upsertToolTip,
    deleteToolTip
};