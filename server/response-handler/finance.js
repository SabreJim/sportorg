const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle, returnError } = require('../middleware/response-handler');
const { getCleanBody, paymentSchema, invoiceSchema, createInvoiceSchema } = require('../middleware/request-sanitizer');

// show members as enrolled or not in the selected season
const getMyInvoices = async(req, res, next) => {
    const myUserId = (req.session && req.session.user_id) ? req.session.user_id : -1;
    await returnInvoices(myUserId, res);
};
const returnInvoices = async (userId, res) => {
    const query = `SELECT
        i.invoice_id,
        i.from_id,
        i.from_type,
        (CASE WHEN i.from_type = 'company' THEN 
            (SELECT company_name FROM beaches.companies where company_id = i.from_id)
            ELSE CONCAT(m.first_name, ' ', m.last_name) END) from_name,
        i.to_id,
        i.to_type,
        CONCAT('[',  GROUP_CONCAT(
            JSON_OBJECT(    'itemId', li.item_id,
                            'description', li.description,
                            'units', li.units,
                            'unitPrice', li.unit_price,
                            'updateDate', li.update_date
            )
        ), ']') as line_items_json,
        CONCAT('$', FORMAT(invoice_amount.amount, 2)) invoice_amount,
        invoice_amount.amount invoice_value,
        CONCAT('$', FORMAT((SELECT SUM(p.amount) FROM beaches.payments p WHERE p.invoice_id = i.invoice_id AND i.to_id = p.to_id), 2)) paid_amount,
        CONCAT('$', FORMAT(invoice_amount.amount - (SELECT SUM(p.amount) FROM beaches.payments p WHERE p.invoice_id = i.invoice_id AND i.to_id = p.to_id), 2)) balance,
        (SELECT SUM(p.amount) FROM beaches.payments p WHERE p.invoice_id = i.invoice_id AND i.to_id = p.to_id) paid_value,
        DATE_FORMAT(i.update_date, '%Y-%m-%d') update_date,
        DATE_FORMAT(i.due_date, '%Y-%m-%d') due_date
    FROM beaches.invoices i
    LEFT JOIN beaches.members m ON m.member_id = i.from_id AND i.from_type = 'member'
    LEFT JOIN beaches.line_items li ON li.invoice_id = i.invoice_id
    LEFT JOIN (SELECT invoice_id, SUM(line_total) amount FROM 
        (SELECT li.invoice_id, (li.units * li.unit_price) line_total FROM beaches.line_items li GROUP BY li.item_id) line_total GROUP BY invoice_id) 
        invoice_amount ON invoice_amount.invoice_id = i.invoice_id
    WHERE i.cancelled != 'Y'
    AND i.from_id IN
        (SELECT m.member_id FROM beaches.members m WHERE
            (EXISTS (SELECT user_id from beaches.member_users mu where m.member_id = mu.member_id AND mu.user_id = ${userId})
                OR (SELECT u.is_admin FROM beaches.users u where u.user_id = ${userId}) = 'Y'
                )
         )
    group by i.invoice_id, i.from_id, i.from_type, i.to_id, i.to_type, from_name, invoice_amount.amount;`;
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
        (SELECT invoice_amount.amount) invoice_amount,
        (SELECT li.description FROM beaches.line_items li where li.invoice_id = p.invoice_id LIMIT 1) invoice_description,
        DATE_FORMAT(p.update_date, '%Y-%m-%d') payment_date
    FROM beaches.payments p
    INNER JOIN beaches.members m ON m.member_id = p.from_id
    LEFT JOIN beaches.invoices i ON i.invoice_id = p.invoice_id AND i.cancelled != 'Y'
    LEFT JOIN (SELECT invoice_id, SUM(line_total) amount FROM 
        (SELECT li.invoice_id, (li.units * li.unit_price) line_total FROM beaches.line_items li GROUP BY li.item_id) line_total GROUP BY invoice_id) 
        invoice_amount ON invoice_amount.invoice_id = i.invoice_id
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
    if (statementResult && statementResult.new_id) {
        returnSingle(res, { newId: statementResult.new_id});
    } else {
        returnError(res, 'An error occurred when updating this record');
    }
};

const upsertInvoice = async(req, res, next) => {
    let body = getCleanBody(req.body, invoiceSchema);
    if (body.cleanBody.invoiceId > -1) {
        // updating an existing invoice, so only line items can be updated
        if (body.cleanBody.lineItems && body.cleanBody.lineItems.length) {
            const items = body.cleanBody.lineItems;
            let allChecked = true;
            let rowsUpdated = 0;
            for (const item of items) {
                if (item.itemId > 0) {
                    const statement = `UPDATE beaches.line_items SET 
                    description = '${item.description}',
                    unit_price = ${item.unitPrice},
                    units = ${item.units},
                    update_date = CURDATE()
                    WHERE item_id = ${item.itemId} 
                    AND (description != '${item.description}' OR unit_price != ${item.unitPrice} OR units != ${item.units})
                `;
                    const result = await MySQL.runCommand(statement);
                    if (!result || result.length === 0) {
                        allChecked = false;
                        break;
                    } else {
                        rowsUpdated++;
                    }
                } else if (item.itemId === -1) {
                    const statement = `INSERT INTO beaches.line_items 
                        (invoice_id, unit_price, units, description, update_date)
                        VALUES
                        (${body.cleanBody.invoiceId}, ${item.unitPrice}, ${item.units}, '${item.description}', CURDATE());`;
                    const result = await MySQL.runCommand(statement);
                    if (!result || result.length === 0) {
                        allChecked = false;
                        break;
                    }
                    else {
                        rowsUpdated++;
                    }
                }
            }
            if (allChecked) {
                if (rowsUpdated > 0) {
                    const parentStatement = `UPDATE beaches.invoices SET update_date = CURDATE() WHERE invoice_id = ${body.cleanBody.invoiceId}`;
                    await MySQL.runCommand(parentStatement);
                }
                returnSingle(res, { invoiceId: body.cleanBody.invoiceId })
            } else {
                returnError(res, 'An error occurred when updating this record');
            }
        }
    } else {
        returnSingle(res, { newId: -1 });
    }
};

const createInvoice = async(req, res, next) => {
    // create a new invoice with no line items
    let body = getCleanBody(req.body, createInvoiceSchema);
    let statement = 'SELECT beaches.create_invoice( ? , ?, ?, ?, ? ) as new_id';
    const statementResult = await MySQL.runCommand(statement,
        [body.cleanBody.fromId, body.cleanBody.fromType, body.cleanBody.toId, body.cleanBody.toType, body.cleanBody.dueDate ]);
    if (!statementResult || !statementResult.new_id) {
        returnSingle(res, { newId: statementResult.new_id });
    } else {
        returnSingle(res, { newId: -1 });
    }
}

const cancelInvoice = async(req, res, next) => {
    let statement = `UPDATE beaches.invoices SET cancelled = 'Y', update_date = CURRENT_TIMESTAMP() WHERE invoice_id = ?`;
    const statementResult = await MySQL.runCommand(statement,
        [req.params.invoiceId ]);
    if (statementResult && statementResult.changedRows) {
        returnSingle(res, { cancelled: statementResult.changedRows});
    } else {
        returnError(res, 'An error occurred when updating this record');
    }
};

module.exports = {
    getMyInvoices,
    getUsersInvoices,
    getMyPayments,
    getUsersPayments,
    recordPayment,
    upsertInvoice,
    createInvoice,
    cancelInvoice
};

