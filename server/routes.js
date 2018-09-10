const KoaRouter = require('koa-router');
const Session = require('./response-handler/session');

const awsExample = function (){
    const awsHandler = new KoaRouter();

    //
    // pageRouter.post('/signup', function(req, res) {
    //     var item = {
    //         'email': {'S': req.body.email},
    //         'name': {'S': req.body.name},
    //         'preview': {'S': req.body.previewAccess},
    //         'theme': {'S': req.body.theme}
    //     };
    //
    //     ddb.putItem({
    //         'TableName': ddbTable,
    //         'Item': item,
    //         'Expected': { email: { Exists: false } }
    //     }, function(err, data) {
    //         if (err) {
    //             var returnStatus = 500;
    //
    //             if (err.code === 'ConditionalCheckFailedException') {
    //                 returnStatus = 409;
    //             }
    //
    //             res.status(returnStatus).end();
    //             console.log('DDB Error: ' + err);
    //         } else {
    //             sns.publish({
    //                 'Message': 'Name: ' + req.body.name + "\r\nEmail: " + req.body.email
    //                 + "\r\nPreviewAccess: " + req.body.previewAccess
    //                 + "\r\nTheme: " + req.body.theme,
    //                 'Subject': 'New user sign up!!!',
    //                 'TopicArn': snsTopic
    //             }, function(err, data) {
    //                 if (err) {
    //                     res.status(500).end();
    //                     console.log('SNS Error: ' + err);
    //                 } else {
    //                     res.status(201).end();
    //                 }
    //             });
    //         }
    //     });
    // });

    return awsHandler;

};
const securedRoutes = function (dynamodb) {
    const secured = new KoaRouter();

    secured.get('/rest/create-table', (ctx) => {
        console.log("getter", dynamodb);

        var params = {
            TableName : "Movies",
            KeySchema: [
                { AttributeName: "year", KeyType: "HASH"},  //Partition key
                { AttributeName: "title", KeyType: "RANGE" }  //Sort key
            ],
            AttributeDefinitions: [
                { AttributeName: "year", AttributeType: "N" },
                { AttributeName: "title", AttributeType: "S" }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 10,
                WriteCapacityUnits: 10
            }
        };

        dynamodb.createTable(params, function(err, data) {
            if (err) {
                console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
            }
        });


        ctx.status = 200;
        ctx.body = {name: "works"};
    });

    secured.post('/rest/insert', (ctx) => {
        console.log("post", ctx.request.body);//, ctx.docClient);
        const movie = ctx.request.body;
        const params = {
            TableName: "Movies",
            Item: movie
        }

        ctx.docClient.put(params, function(err, data) {
            if (err) {
                console.error("Unable to add movie", movie.title, ". Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("PutItem succeeded:", movie.title);
            }
        });

        ctx.status = 200;
        ctx.body = {name: "works"};
    });

    secured.get('/rest/getter', (ctx) => {
        ctx.status = 200;
        ctx.body = {name: "works"};
    });

    secured.get('/rest/login',  (ctx) => Session.login(ctx));
    secured.get('/rest/logout', (ctx) => Session.logout(ctx));


    return secured.middleware();
};



module.exports = Object.freeze({
    securedRoutes
});