const { DynamoDB } = require('aws-sdk');
const dynamo = new DynamoDB.DocumentClient();


// --------------------- Dynamo Operations --------------------------
/**
 * @description
 * @param {string} ItemName
 * @param {Object} Item
 * @param {string} TableName
 * @param {Object} Response
 * @returns {Object}
 */
const createItem = async (ItemName, Item, TableName, Response) => {

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

/**
 * @description
 * @param {string} ItemName
 * @param {Object} Item
 * @param {string} TableName
 * @param {Object} Response
 * @returns {Object}
 */
const deleteItem = async (ItemName, Id, BusinessId, TableName, Response) => {

    const params = {
        TableName,
        Key: {
            businessId: BusinessId,
            id: Id
        },
    }
    try {
        await dynamo.delete(params).promise()
        Response.body = JSON.stringify({ message: `${ItemName} deleted successfully.` })
    } catch (error) {
        console.error(error);
        Response.statusCode = 500;
        Response.body = JSON.stringify({
            message: `Failed to delete ${ItemName}.`,
            error: error.message
        });
    }
    return Response
}

/**
 * @description
 * @param {string} ItemName
 * @param {Object} Name
 * @param {string} BusinessId
 * @param {string} TableName
 * @param {Object} Response
 * @returns {Object}
 */
const getItemByName = async (ItemName, Name, BusinessId, TableName, Response) => {

    try {
        //Create the object with the Dynamo params
        let params = {
            TableName,
            IndexName: 'GSIFindByName',
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

/**
 * @description
 * @param {boolean} Sorting
 * @param {string} ItemName
 * @param {string} BusinessId
 * @param {string} TableName
 * @param {Object} Response
 * @returns {Object}
 */
const getItemOrderedByName = async (Sorting, ItemName, BusinessId, TableName, Response) => {

    try {
        //Create the object with the Dynamo params
        let params = {
            TableName,
            IndexName: 'GSIFindByName',
            ScanIndexForward: Sorting,    //Boolean value to sort ascending if true and descending if false
            KeyConditionExpression: 'businessId = :v_businessId',
            ExpressionAttributeValues: {
                ':v_businessId': BusinessId
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

/**
 * @description
 * @param {string} ItemName
 * @param {string} StartKey
 * @param {string} Limit
 * @param {string} BusinessId
 * @param {string} TableName
 * @param {Object} Response
 * @returns {Object}
 */
const getItems = async (ItemName, StartKey, Limit, BusinessId, TableName, Response) => {

    try {
        //Create the object with the Dynamo params
        let params;

        //If startkey is equals to 0 is the first scan and don't have a startkey
        if (StartKey == '0')
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
                    "id": StartKey
                },
                KeyConditionExpression: 'businessId = :v_businessId',
                ExpressionAttributeValues: {
                    ':v_businessId': BusinessId
                }
            };

        //Create the object with the Dynamo params
        const items = await dynamo.query(params).promise();

        let lastEvaluatedKey = "";
        if (items.LastEvaluatedKey != null)
            lastEvaluatedKey = items.LastEvaluatedKey;

        Response.body = JSON.stringify({
            message: `Get ${ItemName} list successfully.`,
            count: items.Count,
            lastEvaluatedKey,
            items: items.Items
        });

    } catch (error) {
        console.log(error);
        Response.statusCode = 500;
        Response.body = JSON.stringify({
            message: `Failed to get ${ItemName}.`,
            error: error.message
        });
    }

    return Response;
}

/**
 * @description
 * @param {string} ItemName
 * @param {Object} ItemParams
 * @param {Object} Request
 * @param {string} BusinessId
 * @param {string} Id
 * @param {string} TableName
 * @param {Object} Response
 * @returns {Object}
 */
const updateItem = async (ItemName, ItemParams, Request, BusinessId, Id, TableName, Response) => {

    const params = {
        TableName,
        Key: {
            businessId: BusinessId,
            id: Id
        },
        UpdateExpression: `SET ${ItemParams.map((key) => `#${key} = :${key}`).join(",")}`,
        ExpressionAttributeNames: ItemParams.reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}),
        ExpressionAttributeValues: ItemParams.reduce((acc, key) => ({ ...acc, [`:${key}`]: Request[key] }), {}),
        ReturnValues: "UPDATED_NEW",
    }
    try {
        await dynamo.update(params).promise()
        Response.body = JSON.stringify({
            message: `${ItemName} updated successfully.`,
            key: {
                businessId: BusinessId,
                id: Id
            },
            itemData: Request,
        });
    } catch (error) {
        console.error(error)
        Response.statusCode = 500
        Response.body = JSON.stringify({
            message: `Failed to update ${ItemName}.`,
            error: error.message
        })
    }
    
    return Response
}

module.exports = {
    createItem,
    deleteItem,
    getItemByName,
    getItemOrderedByName,
    getItems,
    updateItem
};