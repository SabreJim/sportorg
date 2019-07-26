const AWS = require('aws-sdk');

const buildDBConnections = function (config){
    AWS.config.update({
        region: "us-west-2",
        endpoint: "http://localhost:9999"
    });

    const dbTable =    new AWS.DynamoDB();
     const docClient = new AWS.DynamoDB.DocumentClient();

    return async function (ctx, next) {
        ctx.dynamoTable = dbTable;
        ctx.docClient = docClient;
        await next();
    };
};

module.exports = Object.freeze({
    buildDBConnections
});