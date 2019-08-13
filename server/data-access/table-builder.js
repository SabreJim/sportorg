
const classesTableDefinition = {
    TableName : "Classes",
    KeySchema: [
        { AttributeName: "classId", KeyType: "HASH"},  //Partition key: unique id
        { AttributeName: "season", KeyType: "RANGE" }  //Sort key: season it occurs summer2019
    ],
    AttributeDefinitions: [
        { AttributeName: "classId", AttributeType: "N" },
        { AttributeName: "season", AttributeType: "S" }
    ],
    GlobalSecondaryIndexes: [
        {
            IndexName: 'classSeasonIndex',
            KeySchema: [
                {AttributeName: 'classId', KeyType: 'HASH'},
                {AttributeName: 'season', KeyType: 'RANGE'},
            ],
            Projection: { ProjectionType: 'ALL'},
            ProvisionedThroughput:{ ReadCapacityUnits: 10, WriteCapacityUnits: 10 }
        }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};

const dropAllTables = (ctx) => {
    return new Promise((resolve, reject) => {
        ctx.dbTable.listTables({}, async (err, data) => {
            if (err) reject(err);
            else console.log('DELETING TABLES:', data.TableNames);

            data.TableNames.forEach((name) => {
                ctx.dbTable.deleteTable({TableName: name}, (err, deleteData) => {
                    console.log('deleted', deleteData.TableDescription.TableName);
                    resolve(deleteData);
                });
            });

        });
    });
};

const rebuildTables = (ctx, req, res) => {
    const baseTables = [classesTableDefinition];

    dropAllTables(ctx).then(() => {
        ctx.dbTable.listTables({}, (err, data) => {
            if (err) console.log('error listing tables', err);
            else console.log('TABLES:', data.TableNames);

            const promises = [];
            baseTables.forEach((tableDef) => {
                promises.push(new Promise((resolve, reject) => {
                    ctx.dbTable.createTable(tableDef, function(err, data) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data);
                        }
                    });
                }));
            });

            Promise.all(promises).then((allItems) => {
                console.log('all promises', allItems);
                res.json(allItems);
            })
        });
    })


};

module.exports = {
    rebuildTables
};