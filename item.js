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

    try {
        validationResponse = await validate_name(ItemName, Body?.name, Body?.businessId, TableName)
    } catch (error) {
        console.log(error)
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: `Failed to validate ${ItemName}.`,
            error: error.message
        })
    }
    const {status} = JSON.parse(validationResponse.body);
    if (status) {
        const id = uuid.v4();
        const newItem = {
            id,
            ...Body
        };
        try {
            response = await dynamoDB.createItem(ItemName, newItem, TableName, response);
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
            error: `${ItemName} "${Body?.name}" already exists.`
        });
    }
    return response;
}
async function get_all(ItemName, Name, Limit, BusinessId, TableName) {
    
    //create the response object
    let response = {
        statusCode: 200,
        isBase64Encoded: false,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify({ message: `Get all ${ItemName}.` })
    };

    try {
        response = await dynamoDB.getItems(ItemName, Name, Limit, BusinessId, TableName, response);
    } catch (error) {
        console.error(error);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: `Failed to get ${ItemName}.`,
            error: error.message
        });
    }

    return response;
}
async function get_by_name(ItemName, Name, BusinessId, TableName) {
    
    //create the response object
    let response = {
        statusCode: 200,
        isBase64Encoded: false,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify({ message: `Get ${ItemName}.` })
    };

    try {
        response = await dynamoDB.getItemByName(ItemName, Name, BusinessId, TableName, response);
    } catch (error) {
        console.error(error);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: `Failed to get ${ItemName}.`,
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
        body: JSON.stringify({ message: `Get ${ItemName}.` })
    };
    try {
        //Parse ORDER String to a boolean value
        //True:Ascending  - False:descending
        let ascending;
        if (Order == 'DESC')
            ascending = false;
        else
            ascending = true;

        response = await dynamoDB.getItemOrderedByName(ascending, ItemName, BusinessId, TableName, response);

    } catch (error) {
        console.error(error);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: `Failed to get ${ItemName}.`,
            error: error.message
        });
    }

    return response;
}

async function validate_name(ItemName, Name, BusinessId, TableName) {
    
    let response = {
        statusCode: 200,
        isBase64Encoded: false,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify({ message: `Validate ${ItemName} name.` })
    };

    try {
        response = await get_by_name(ItemName, Name, BusinessId, TableName);
        let result = JSON.parse( response.body );
        // Check if the result.Count contain a value, the name already exists
        if (result.count == 0){
            response.body = JSON.stringify({
                status: true,
                message: `${ItemName} name ${Name} available.`,
            });
        }
        else {
            response.statusCode = 403;
            response.body = JSON.stringify({
                status: false,
                message: `${ItemName} ${Name} already exists.`,
                item: result.Items[0]
            });
        }
    } catch (error) {
        console.log(error);
        response.statusCode = 500;
        response.body = JSON.stringify({
            status: false,
            message: `Failed to validate ${ItemName}.`,
            error: error.message
        });
    }
    return response;
}

module.exports = {
    create_one,
    get_all,
    get_by_name,
    get_ordered,
    validate_name
};