const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle, returnError } = require('../middleware/response-handler');
const { getCleanBody, companySchema } = require('../middleware/request-sanitizer');

// show members as enrolled or not in the selected season
const getCompanies = async(req, res, next) => {
    const query = `SELECT c.*, r.region_name, r.region_code from beaches.companies c
                    LEFT JOIN beaches.regions r ON r.region_id = c.region_id`;
    const myInvoices = await MySQL.runQuery(query);
    returnResults(res, myInvoices);
};

const upsertCompany = async (req, res, next) => {
    let body = req.body;
    const cleanCompany = getCleanBody(body, companySchema);
    if (cleanCompany.isValid) {
        let statement;
        if (cleanCompany.isEdit){
            statement = `UPDATE beaches.companies SET ${cleanCompany.setters.join(', ')} WHERE company_id = ${cleanCompany.cleanBody.companyId}`;
        } else {
            statement = `INSERT INTO beaches.companies ${cleanCompany.insertValues}`;
        }
        const statementResult = await MySQL.runCommand(statement);
        if (statementResult && statementResult.affectedRows) {
            returnSingle(res, {affectedRows: statementResult.affectedRows});
        } else {
            returnError(res, 'An error occurred when updating this record');
        }
    } else {
        returnError(res,'Company could not be updated');
    }
};

const deleteCompany = async (req, res) => {
    const companyId = req.params.companyId;
    if (!companyId) {
        return returnError(res, 'A company ID is required');
    }
    const statement = `DELETE FROM beaches.companies WHERE company_id = ${companyId}`;
    const statementResult = await MySQL.runCommand(statement);
    if (statementResult && statementResult.affectedRows) {
        returnSingle(res, {affectedRows: statementResult.affectedRows});
    } else {
        returnError(res, 'An error occurred when deleting this record');
    }
};

module.exports = {
    getCompanies,
    upsertCompany,
    deleteCompany
}
