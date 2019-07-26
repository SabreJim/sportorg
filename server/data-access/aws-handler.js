// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
const R = require('ramda');
const UUID = require('uuid/v4');

const connectAWS = async function(){
    AWS.config.update({region: 'CA'});
// Create the DynamoDB service object
    const ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});
    return ddb;
};


const getItem = async function(tableName, partitionKey, sortKey){

};

const getItemSet = async function(tableName, partitionKey, sortKey, requestedFields = null) {
    if (!partitionKey){
        console.log("no key to search by");
    }

    const queryParams = {
        "TableName": tableName,
        "Key": {},
        "ProjectionExpression":"LastPostDateTime, Message, Tags",
       // "ConsistentRead": true,
        "ReturnConsumedCapacity": "TOTAL"
    };
    queryParams.Key.partitionKey = partitionKey; // should be an object like {"S": "text to search for"}
    if (sortKey){
        queryParams.Key.sortKey = sortKey; // should be an object like {"S": "text to search for"}
    }
    if (requestedFields){
        queryParams.ProjectionExpression = requestedFields; // should be a string list of items: "one, two, three"
    }

    const conn = await connectAWS();
    return conn.query(params); // should be a promise
};

const insertItem = async function (tableName, partitionName, sortName, item) {
    const conn = await connectAWS();
    if (!partitionName || !sortName) {
        return Promise.resolve({"error": "partition and sort keys are required"});
    }

    let partitionValue = R.prop(partitionName, item);
    if (!partitionValue) {
        // auto generate an item partition
        // useful for say user generated events
        partitionValue = UUID();
    }

    let sortValue = R.prop(sortName, item);
    if (!sortValue) {
        // generate if not provided
        sortValue = UUID();
    }

    return conn.putItem({
        'TableName': tableName,
        'Item': item,
        'ConditionExpression': {partitionName }
    }, function (err, data) {
        return data;
    });
};

const updateItem = async function (tableName, partitionName, sortName, item) {
    const conn = await connectAWS();
    if (!partitionName || !sortName) {
        return Promise.resolve({"error": "partition and sort keys are required"});
    }

    let partitionValue = R.prop(partitionName, item);
    if (!partitionValue) {
        // auto generate an item partition
        // useful for say user generated events
        partitionValue = UUID();
    }


    let sortValue = R.prop(sortName, item);
    if (!sortValue) {
        // generate if not provided
        sortValue = UUID();
    }

    return conn.putItem({
        'TableName': tableName,
        'Item': item,
        'ConditionExpression': {partitionName }
    }, function (err, data) {
        return data;
    });
};

    //     var item = {
//         'email': {'S': req.body.email},
//         'name': {'S': req.body.name},
//         'preview': {'S': req.body.previewAccess},
//         'theme': {'S': req.body.theme}
//     };
//

module.exports = Object.freeze({
    getItem,
    getItemSet,
    upsertItem
});