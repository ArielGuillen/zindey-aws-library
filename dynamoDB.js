const { DynamoDB } = require('aws-sdk');
const dynamo = new DynamoDB.DocumentClient();

// --------------------- Dynamo Operations --------------------------
async function createItem(ItemName, Item, TableName, Response) {

    try {
        await dynamo.put({
            TableName,
            Item
        }).promise();

        Response.body = JSON.stringify({
            message: `${ItemName} created successfully.`,
            item: Item
        });
    } catch (error) {
        console.error(error);
        Response.statusCode = 500;
        Response.body = JSON.stringify({
            message: `Failed to create ${ItemName}`,
            error: error.message
        });
    }
    return Response
}

async function getItemOrderedByName( Descending, ItemName, businessId, TableName, Response) {

    try {
        //Create the object with the Dynamo params
        var params = {
            TableName,
            ScanIndexForward: Descending,    //Boolean value to sort ascending if false and descending if true
            KeyConditionExpression: 'businessId = :v_businessId',
            ExpressionAttributeValues: {
                ':v_businessId': businessId
            }
        };
        
        const result = await dynamo.query(params).promise();
        Response.body = JSON.stringify({ 
            message: `Get ${ItemName} successfully.`,
            result
        });
    } catch (error) {
        console.error(error);
        Response.statusCode = 500;
        Response.body = JSON.stringify({
            message: `Failed to get ${ItemName}`,
            error: error.message
        });
    }
    return Response
}

async function getItemByName(ItemName, name, GSIName, TableName, Response) {

    try {
        const params = {
            TableName,
            IndexName : GSIName,
            KeyConditionExpression: '#name = :v_name',
            ExpressionAttributeNames: {
                '#name': 'name',
            },
            ExpressionAttributeValues: {
                ':v_name': name
            }
        };
        
        const result = await dynamo.query(params).promise();
        Response.body = JSON.stringify({ 
            message: `Get ${ItemName} successfully.`,
            result
        });
    
    } catch (error) {
        console.error(error);
        Response.statusCode = 500;
        Response.body = JSON.stringify({
            message: `Failed to get ${ItemName}`,
            error: error.message
        });
    }
    return Response
}

module.exports = {
    createItem,
    getItemByName,
    getItemOrderedByName
};