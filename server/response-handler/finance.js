const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle, returnError } = require('../middleware/response-handler');
const { getCleanBody, paymentSchema } = require('../middleware/request-sanitizer');

// show members as enrolled or not in the selected season
const getMyInvoices = async(req, res, next) => {
    const myUserId = (req.session && req.session.user_id) ? req.session.user_id : -1;
    await returnInvoices(myUserId, res);
};
const returnInvoices = async (userId, res) => {
    const query = `SELECT
        i.invoice_id,
        (SELECT i.from_id) member_id,
        CONCAT(m.first_name, ' ', m.last_name) member_name,
        CONCAT('[',  GROUP_CONCAT(
            JSON_OBJECT(    'itemId', li.item_id,
                            'description', li.description,
                            'units', li.units,
                            'unitPrice', li.unit_price,
                            'updateDate', li.update_date
            )
        ), ']') as line_items_json,
        CONCAT('$', FORMAT(i.amount, 2)) invoice_amount,
        CONCAT('$', FORMAT((SELECT SUM(p.amount) FROM beaches.payments p WHERE p.invoice_id = i.invoice_id AND i.to_id = p.to_id), 2)) paid_amount,
        CONCAT('$', FORMAT(i.amount - (SELECT SUM(p.amount) FROM beaches.payments p WHERE p.invoice_id = i.invoice_id AND i.to_id = p.to_id), 2)) balance,
        DATE_FORMAT(i.update_date, '%Y-%m-%d') update_date
    FROM beaches.invoices i
    INNER JOIN beaches.members m ON m.member_id = i.from_id
    LEFT JOIN beaches.line_items li ON li.invoice_id = i.invoice_id
    WHERE i.to_type = 'company' AND i.to_id = (SELECT private_key FROM beaches.projects where type = 'config' and private_key_id = 'companyId')
    AND i.from_type = 'member' AND i.from_id IN
        (SELECT m.member_id FROM beaches.members m WHERE
            (EXISTS (SELECT user_id from beaches.member_users mu where m.member_id = mu.member_id AND mu.user_id = ${userId})
                OR (SELECT u.is_admin FROM beaches.users u where u.user_id = ${userId}) = 'Y'
                )
         )
    group by i.invoice_id, member_id, member_name, i.amount`;
    const myInvoices = await MySQL.runQuery(query);
    returnResults(res, myInvoices);
}

const getUsersInvoices = async(req, res, next) => {
    const userId = req.params.userId;
    await returnInvoices(userId, res);
};

const returnPayments = async(userId, res) => {
    const query = `SELECT
    p.payment_id,
        CONCAT('$', FORMAT(p.amount, 2)) payment_amount,
        p.payment_method,
        (SELECT p.from_id) member_id,
        CONCAT(m.first_name, ' ', m.last_name) member_name,
        p.invoice_id,
        (select i.amount) invoice_amount,
        (SELECT li.description FROM beaches.line_items li where li.invoice_id = p.invoice_id LIMIT 1) invoice_description,
        DATE_FORMAT(p.update_date, '%Y-%m-%d') payment_date
    FROM beaches.payments p
    INNER JOIN beaches.members m ON m.member_id = p.from_id
    LEFT JOIN beaches.invoices i ON i.invoice_id = p.invoice_id
    WHERE p.to_type = 'company' AND p.to_id = (SELECT private_key FROM beaches.projects where type = 'config' and private_key_id = 'companyId')
    AND p.from_type = 'member' AND p.from_id IN
        (SELECT m.member_id FROM beaches.members m WHERE
        (EXISTS (SELECT user_id from beaches.member_users mu where m.member_id = mu.member_id AND mu.user_id = ${userId})
            OR (SELECT u.is_admin FROM beaches.users u where u.user_id = ${userId}) = 'Y'
        )
    )`;
    const myPayments = await MySQL.runQuery(query);
    returnResults(res, myPayments);
}
const getMyPayments = async(req, res, next) => {
    const myUserId = (req.session && req.session.user_id) ? req.session.user_id : -1;
    await returnPayments(myUserId, res);
};
const getUsersPayments = async(req, res, next) => {
    const userId = req.params.userId;
    await returnPayments(userId, res);
};

const recordPayment = async(req, res, next) => {
    const myUserId = (req.session && req.session.user_id) ? req.session.user_id : -1;

    let body = getCleanBody(req.body, paymentSchema);

    let statement = 'SELECT beaches.record_payment( ? , ? ) as new_id';
    const statementResult = await MySQL.runCommand(statement,
        [myUserId, JSON.stringify(body.cleanBody) ]);
    console.log('RESULT', statementResult, body.cleanBody);
    if (statementResult && statementResult.length) {
        returnSingle(res, { newId: statementResult[0].newId});
    } else {
        returnError(res, 'An error occurred when updating this record');
    }
};

const cancelInvoice = async(req, res, next) => {

};

module.exports = {
    getMyInvoices,
    getUsersInvoices,
    getMyPayments,
    getUsersPayments,
    recordPayment,
    cancelInvoice
};

