const R = require('ramda');

const parseItem = (request, propName, type, mask, operator, result ) => {
    const newResult = (result !== null) ? Object.assign({}, result) : {attributes: {}, expression: ''};
    if (request[propName]) {
        let attribute = {};
        attribute = {"S": propName };
        // attribute[type] = propName;
        newResult.attributes[mask] = attribute;

        newResult.expression = newResult.expression + `${mask} ${operator} ${request[propName]}`;
    }
    return newResult;
};

const responseWrapper = R.curry((resolve, reject, err, data) => {
    console.log('in wrapper', err, data, 'promise', resolve, reject);
    if (err) {
        reject({success: false, result: err });
    }
    resolve({ success: true, result: data });
});


const getEntity = async (ctx, partitionKey, sortKey) => {

}

const getAllEntities = (ctx, tableName) => {
    return new Promise((resolve, reject) => {
        ctx.docClient.scan({ TableName: tableName }, (err, data) => {
            console.log('SCANN', data);
            resolve(data);
        })
    })
};

// available operators: EQ | NE | LE | LT | GE | GT | NOT_NULL | NULL | CONTAINS | NOT_CONTAINS | BEGINS_WITH | IN | BETWEEN
const searchEntity = (ctx, res, tableName, query ) => {
    const params = {
        ExpressionAttributeValues: query.attributes,
        KeyConditionExpression: query.expression,
        // ProjectionExpression: 'Episode, Title, Subtitle',
        // FilterExpression: 'contains (Subtitle, :topic)',
        TableName: tableName
    };
    console.log('about to fire', params, query);
    return new Promise((resolve, reject) => {
        ctx.docClient.query(params, responseWrapper(resolve, reject));
    })
};

const addEntity = async (ctx, tableName, itemBody) => {
    const params = {
        TableName: tableName,
        Item: itemBody
    };

    await ctx.docClient.put(params, function(err, data) {
        if (err) {
            console.error(`Unable to add to table: ${tableName} Error JSON: ${JSON.stringify(err, null, 2)}`);
        } else {
            console.log(`SUCCESS: added item to ${tableName}`);
        }
    });
};

const updateEntity = async (ctx, req, res) => {

}

const deleteEntity = async (ctx, req, res) => {

}

module.exports = {
    parseItem,
    getEntity,
    getAllEntities,
    searchEntity,
    addEntity,
    updateEntity,
    deleteEntity
}