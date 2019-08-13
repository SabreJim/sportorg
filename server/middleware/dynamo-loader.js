const AWS = require('aws-sdk');

const buildDBConnections = function (config){
    AWS.config.update(config.AWS);

    const dbTable =    new AWS.DynamoDB();
    const docClient = new AWS.DynamoDB.DocumentClient();

    return async function (ctx, next) {
        ctx.dynamoTable = dbTable;
        ctx.docClient = docClient;
        await next();
    };
};

const buildDBConnectionsXP = (awsConfig, ctx) => {
    console.log('got config', awsConfig);
    AWS.config.update(awsConfig);
    return async (req, res, next) => {
        if (!ctx){
            ctx = {};
        }
        ctx.dbTable = new AWS.DynamoDB();
        ctx.docClient = new AWS.DynamoDB.DocumentClient();

        await next();
    }
};

module.exports = Object.freeze({
    buildDBConnections,
    buildDBConnectionsXP
});