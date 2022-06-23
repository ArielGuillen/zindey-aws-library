const dynamoDB = require('./dynamoDB');
const uuid = require('uuid');

async function create_one(ItemName, Body, TableName) {

    let validationResponse = {};
    //create the response object
    let response = {
        statusCode: 200,
        isBase64Encoded: false,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify({ message: `Create ${ItemName}.` })
    };

    // try {
    //     validationResponse = await itemTypeElement(LAMBDA_NAME, Body?.name)
    // } catch (error) {
    //     console.log(error)
    //     response.statusCode = 500;
    //     response.body = JSON.stringify({
    //         message: `Failed to validate ${ItemName}.`,
    //         error: error.message
    //     })
    // }

    validationResponse.status = true;
    if (validationResponse?.status) {
        const id = uuid.v4();
        const newItem = {
            id,
            ...Body
        };
        try{ 
            response = dynamoDB.createItem(ItemName, newItem, TableName, response);
        } catch (error) {
            console.error(error);
            response.statusCode = 500;
            response.body = JSON.stringify({
                message: `Failed to create ${ItemName}`,
                error: error.message
            });
        }
    } else {
        response.statusCode = 403;
        response.body = JSON.stringify({
            message: `Failed to create ${ItemName}.`,
            error: `${ItemName} "${body?.name}" already exists.`,
            validationResponse
        });
    }
    return response;
}

async function get_by_name(ItemName, Name, TableName) {

    //create the response object
    let response = {
        statusCode: 200,
        isBase64Encoded: false,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify({ message: `Get ${ItemName}.` })
    };

    try {
        response = await dynamoDB.getItemByName(ItemName, Name, 'GSIFindByName', TableName, response);
    } catch (error) {
        console.error(error);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: `Failed to get ${ItemName}`,
            error: error.message
        });
    }
    
    return response;
}

async function get_ordered(ItemName, Order, BusinessId, TableName) {

    //create the response object
    let response = {
        statusCode: 200,
        isBase64Encoded: false,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify({ message: `Get ${ItemName}` })
    };
    try {     
        //Parse ORDER String to a boolean value
        //True:Ascending  - False:descending
        let ascending;
        if( Order == 'DESC' )
            ascending = false;
        else
            ascending = true;

        response = await dynamoDB.getItemOrderedByName(ascending , ItemName, BusinessId, TableName, response);

    } catch (error) {
        console.error(error);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: `Failed to get ${ItemName}`,
            error: error.message
        });
    }

    return response;
}

module.exports = {
    create_one,
    get_by_name,
    get_ordered
};