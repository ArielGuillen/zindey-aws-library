const { DynamoDB } = require('aws-sdk');
const dynamo = new DynamoDB.DocumentClient();


// --------------------- Dynamo Operations --------------------------
/**
 * @description
 * @param {Object} params           Object with the parmameters required
 * @param {string} params.ItemName
 * @param {Object} params.Item
 * @param {string} params.TableName
 * @param {Object} params.Response  Object with the response format to lambda functions
 * @returns {Object}
 */
const createItem = async (params) => {

    try {
        await dynamo.put({
            TableName: params?.TableName,
            Item: params?.Item
        }).promise();

        params.Response.body = JSON.stringify({
            message: `${params?.ItemName} created successfully.`,
            item: params?.Item
        });
    } catch (error) {
        console.error(error);
        params.Response.statusCode = 500;
        params.Response.body = JSON.stringify({
            message: `Failed to create ${params?.ItemName}.`,
            error: error.message
        });
    }
    return params?.Response;
};

/**
 * @description
 * @param {Object} params           Object with the parmameters required
 * @param {string} params.ItemName
 * @param {Object} params.Key
 * @param {string} params.TableName
 * @param {Object} params.Response  Object with the response format to lambda functions
 * @returns {Object}
 */
const deleteItem = async (params) => {

    const dynamoParams = {
        TableName: params?.TableName,
        Key: params?.Key
    };
    try {
        await dynamo.delete(dynamoParams).promise();
        params.Response.body = JSON.stringify({ message: `${params?.ItemName} deleted successfully.` });
    } catch (error) {
        console.error(error);
        params.Response.statusCode = 500;
        params.Response.body = JSON.stringify({
            message: `Failed to delete ${params?.ItemName}.`,
            error: error.message
        });
    }
    return params?.Response;
};

/**
 * @description
 * @param {Object} params           Object with the parmameters required
 * @param {string} params.ItemName
 * @param {string} params.GSIName          // GSI Name to query from an attribute
 * @param {string} params.AttributeName    // Attribute to find
 * @param {string} params.AttributeValue   // Attribute value to find
 * @param {string} params.BusinessId
 * @param {string} params.TableName
 * @param {Object} params.Response  Object with the response format to lambda functions
 * @returns {Object}
 */
const getItemByAttribute = async (params) => {

    try {
        //Create the object with the Dynamo params
        let dynamoParams = {
            TableName: params?.TableName,
            IndexName: params?.GSIName,
            KeyConditionExpression: 'businessId = :v_businessId AND #attName = :v_attribute',
            ExpressionAttributeNames: {
                '#attName': params?.AttributeName
            },
            ExpressionAttributeValues: {
                ':v_businessId': params?.BusinessId,
                ':v_attribute': params?.AttributeValue
            }
        };

        const result = await dynamo.query(dynamoParams).promise();
        params.Response.body = JSON.stringify({
            message: `Get ${params?.ItemName} successfully.`,
            count: result.Count,
            items: result.Items
        });

    } catch (error) {
        console.error(error);
        params.Response.statusCode = 500;
        params.Response.body = JSON.stringify({
            message: `Failed to get ${params?.ItemName}.`,
            error: error.message
        });
    }
    return params?.Response;
};

/**
 * @description
 * @param {Object} params           Object with the parmameters required
 * @param {boolean} params.Sorting
 * @param {string} params.ItemName
 * @param {string} params.BusinessId
 * @param {string} params.TableName
 * @param {Object} params.Response  Object with the response format to lambda functions
 * @returns {Object}
 */
const getItemOrderedByGSI = async (params) => {

    try {
        //Create the object with the Dynamo params
        let dynamoParams = {
            TableName: params?.TableName,
            IndexName: params?.GSIName,
            ScanIndexForward: params?.Sorting,    //Boolean value to sort ascending if true and descending if false
            KeyConditionExpression: 'businessId = :v_businessId',
            ExpressionAttributeValues: {
                ':v_businessId': params?.BusinessId
            }
        };

        const result = await dynamo.query(dynamoParams).promise();
        params.Response.body = JSON.stringify({
            message: `Get ${params?.ItemName} successfully.`,
            count: result.Count,
            items: result.Items
        });
    } catch (error) {
        console.error(error);
        params.Response.statusCode = 500;
        params.Response.body = JSON.stringify({
            message: `Failed to get ${params?.ItemName}.`,
            error: error.message
        });
    }
    return params?.Response;
};

/**
 * @description
 * @param {Object} params           Object with the parmameters required
 * @param {string} params.ItemName
 * @param {string} params.StartKey
 * @param {string} params.Limit
 * @param {string} params.BusinessId
 * @param {string} params.TableName
 * @param {Object} params.Response  Object with the response format to lambda functions
 * @returns {Object}
 */
const getItems = async (params) => {

    try {
        //Create the object with the Dynamo params
        let dynamoParams;

        //If startkey is equals to 0 is the first scan and don't have a startkey
        if (params?.StartKey == '0')
            dynamoParams = {
                TableName: params?.TableName,
                Limit: params?.Limit,
                KeyConditionExpression: 'businessId = :v_businessId',
                ExpressionAttributeValues: {
                    ':v_businessId': params?.BusinessId
                }
            };
        else
            dynamoParams = {
                TableName: params?.TableName,
                Limit: params?.Limit,
                ExclusiveStartKey: {
                    "businessId": params?.BusinessId,
                    "id": params?.StartKey
                },
                KeyConditionExpression: 'businessId = :v_businessId',
                ExpressionAttributeValues: {
                    ':v_businessId': params?.BusinessId
                }
            };

        //Create the object with the Dynamo params
        const items = await dynamo.query(dynamoParams).promise();

        let lastEvaluatedKey = "";
        if (items.LastEvaluatedKey != null)
            lastEvaluatedKey = items.LastEvaluatedKey;

        params.Response.body = JSON.stringify({
            message: `Get ${params?.ItemName} list successfully.`,
            count: items.Count,
            lastEvaluatedKey,
            items: items.Items
        });

    } catch (error) {
        console.log(error);
        params.Response.statusCode = 500;
        params.Response.body = JSON.stringify({
            message: `Failed to get ${params?.ItemName}.`,
            error: error.message
        });
    }

    return params?.Response;
};

/**
 * @description
 * @param {Object} params           Object with the parmameters required
 * @param {string} params.ItemName
 * @param {Object} params.ItemParams
 * @param {Object} params.Request
 * @param {Object} params.Key       Primary Key
 * @param {string} params.TableName
 * @param {Object} params.Response  Object with the response format to lambda functions
 * @returns {Object}
 */
const updateItem = async (params) => {

    const dynamoParams = {
        TableName: params?.TableName,
        Key: params?.Key,
        UpdateExpression: `SET ${params?.ItemParams.map((key) => `#${key} = :${key}`).join(",")}`,
        ExpressionAttributeNames: params?.ItemParams.reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}),
        ExpressionAttributeValues: params?.ItemParams.reduce((acc, key) => ({ ...acc, [`:${key}`]: params?.Request[key] }), {}),
        ReturnValues: "UPDATED_NEW",
    };
    try {
        await dynamo.update(dynamoParams).promise();
        params.Response.body = JSON.stringify({
            message: `${params?.ItemName} updated successfully.`,
            Key: params?.Key,
            itemData: params?.Request,
        });
    } catch (error) {
        console.error(error);
        params.Response.statusCode = 500;
        params.Response.body = JSON.stringify({
            message: `Failed to update ${params?.ItemName}.`,
            error: error.message
        });
    }
    
    return params.Response;
};

module.exports = {
    createItem,
    deleteItem,
    getItemByAttribute,
    getItemOrderedByGSI,
    getItems,
    updateItem
};