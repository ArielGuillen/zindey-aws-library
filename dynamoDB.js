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
            message: `Failed to create ${ItemName}.`,
            error: error.message
        });
    }
    return Response
}

async function getItemByName(ItemName, Name, BusinessId, TableName, Response) {

    try {
        //Create the object with the Dynamo params
        let params = {
            TableName,
            IndexName : 'GSIFindByName',
            KeyConditionExpression: 'businessId = :v_businessId AND #name = :v_name',
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ExpressionAttributeValues: {
                ':v_businessId': BusinessId,
                ':v_name': Name
            }
        };
        
        const result = await dynamo.query(params).promise();
        Response.body = JSON.stringify({ 
            message: `Get ${ItemName} successfully.`,
            count: result.Count,
            items: result.Items
        });
    
    } catch (error) {
        console.error(error);
        Response.statusCode = 500;
        Response.body = JSON.stringify({
            message: `Failed to get ${ItemName}.`,
            error: error.message
        });
    }
    return Response
}

async function getItemOrderedByName( Ascending, ItemName, businessId, TableName, Response) {

    try {
        //Create the object with the Dynamo params
        let params = {
            TableName,
            IndexName : 'GSIFindByName',
            ScanIndexForward: Ascending,    //Boolean value to sort ascending if true and descending if false
            KeyConditionExpression: 'businessId = :v_businessId',
            ExpressionAttributeValues: {
                ':v_businessId': businessId
            }
        };
        
        const result = await dynamo.query(params).promise();
        Response.body = JSON.stringify({ 
            message: `Get ${ItemName} successfully.`,
            count: result.Count,
            items: result.Items
        });
    } catch (error) {
        console.error(error);
        Response.statusCode = 500;
        Response.body = JSON.stringify({
            message: `Failed to get ${ItemName}.`,
            error: error.message
        });
    }
    return Response
}

async function getItems( ItemName, Limit, StartKey, BusinessId, TableName, Response){

    try{
        //Create the object with the Dynamo params
        let params;

        //If startkey is equals to 0 is the first scan and don't have a startkey
        if( StartKey == '0' )
            params = {
                TableName,
                Limit,
                KeyConditionExpression: 'businessId = :v_businessId',
                ExpressionAttributeValues: {
                    ':v_businessId': BusinessId
                }
            };
        else
            params = {
                TableName,
                Limit,
                ExclusiveStartKey: {
                    "businessId": BusinessId,
                    "id": Id
                },
                KeyConditionExpression: 'businessId = :v_businessId',
                ExpressionAttributeValues: {
                    ':v_businessId': BusinessId
                }
            };

        //Create the object with the Dynamo params
        const items = await dynamo.query( params ).promise();

        let lastEvaluatedKey = "";
        if( items.LastEvaluatedKey != null )
            lastEvaluatedKey = items.LastEvaluatedKey;

        Response.body = JSON.stringify({ 
            message: `Get ${ItemName} list successfully.`, 
            count: items.Count,
            lastEvaluatedKey,
            items: items.Items
        });

    }catch( error ){
        console.log( error );
        Response.statusCode = 500;
        Response.body = JSON.stringify( { 
            message: `Failed to get ${ItemName}.`, 
            error: error.message
        } );
    }
    
    return Response;
}

async function updateItem(ItemName, ItemParams, BusinessId, Id, TableName, Response) {

    const params = {
        TableName,
        Key: {
            businessId: BusinessId,
            id: Id
        },
        UpdateExpression: `SET ${ItemParams.map((key) => `#${key} = :${key}`).join(",")}`,
        ExpressionAttributeNames: ItemParams.reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}),
        ExpressionAttributeValues: ItemParams.reduce((acc, key) => ({ ...acc, [`:${key}`]: Req[key] }), {}),
        ReturnValues: "UPDATED_NEW",
    }
    try {
        await db.update(params).promise()
        Response.body = JSON.stringify({
            message: `${ItemName} updated successfully.`,
            key: {
                businessId: BusinessId,
                id: Id
            },
            itemData: Req,
        })
    } catch (error) {
        console.error(error)
        Response.statusCode = 500
        Response.body = JSON.stringify({
            message: `Failed to update ${ItemName}.`,
            error: error.message
        })
    }
}

module.exports = {
    createItem,
    getItemByName,
    getItemOrderedByName,
    getItems,
    updateItem
};