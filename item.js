const dynamoDB = require('./dynamoDB');
const uuid = require('uuid');

/**
 * @description
 * @param {string} ItemName
 * @param {Object} Body
 * @param {string} TableName
 * @returns {Object}
 */
const create_one = async (ItemName, Body, TableName) => {

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
    const { status } = JSON.parse(validationResponse.body);
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


/**
 * @description
 * @param {string} ItemName
 * @param {string} Id
 * @param {string} BusinessId
 * @param {string} TableName
 * @returns {Object}
 */
const delete_one = async (ItemName, Id, BusinessId, TableName) => {
    let response = {
        isBase64Encoded: false,
        statusCode: 200,
        body: JSON.stringify({ message: `Delete ${ItemName}.` }),
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
    }
    try {
        response = await dynamoDB.deleteItem(ItemName, Id, BusinessId, TableName, response)
    } catch (error) {
        console.log(error)
        response.statusCode = 500
        response.body = JSON.stringify({
            message: `Failed to delete ${ItemName}.`,
            error: error.message
        })
    }
    return response
}

/**
 * @description
 * @param {string} ItemName
 * @param {string} StartKey
 * @param {string} Limit
 * @param {string} BusinessId
 * @param {string} TableName
 * @returns {Object}
 */
const get_all = async (ItemName, StartKey, Limit, BusinessId, TableName) => {

    //create the response object
    let response = {
        statusCode: 200,
        isBase64Encoded: false,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify({ message: `Get all ${ItemName}.` })
    };

    try {
        response = await dynamoDB.getItems(ItemName, StartKey, Limit, BusinessId, TableName, response);
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

/**
 * @description
 * @param {string} ItemName
 * @param {Object} Name
 * @param {string} BusinessId
 * @param {string} TableName
 * @returns {Object}
 */
const get_by_name = async (ItemName, Name, BusinessId, TableName) => {

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

/**
 * @description
 * @param {string} ItemName
 * @param {string} Order    Send DESC for descending order
 * @param {string} BusinessId
 * @param {string} TableName
 * @returns {Object}
 */
const get_ordered = async (ItemName, Order, BusinessId, TableName) => {

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
        let sorting = Order == 'DESC' ?
            false : true
        response = await dynamoDB.getItemOrderedByName(sorting, ItemName, BusinessId, TableName, response);

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

/**
 * @description
 * @param {string} ItemName
 * @param {Object} Req
 * @param {string} BusinessId
 * @param {string} Id
 * @param {string} TableName
 * @returns {Object}
 */
const update_one = async (ItemName, Req, BusinessId, Id, TableName) => {

    let validationResponse = {}
    //create the response object
    
    let response = {
        statusCode: 200,
        isBase64Encoded: false,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify({ message: `Update ${ItemName}.` })
    };

    // Validate name before update
    try {
        validationResponse = await validate_name(ItemName, Req?.name, BusinessId, TableName)
    } catch (error) {
        response.statusCode = 500
        response.body = JSON.stringify({
            message: "Failed to validate item.",
            error: error.message
        })
    }
    try{
        //Check response
        const { status, item } = JSON.parse(validationResponse.body);
        if (status || item.id == Id) {
            const ItemParams = Object.keys(Req);
            response = await dynamoDB.updateItem(ItemName, ItemParams, Req, BusinessId, Id, TableName, response);
        } else {
            response.statusCode = 403;
            response.body = JSON.stringify({
                message: "Failed to update item.",
                error: `Item "${Name}" already exists.`,
            })
        }
    } catch (error) {
        console.error(error);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: `Failed to update ${ItemName}`,
            error: error.message
        });
    }
    return response;
}

/**
 * @description
 * @param {string} ItemName
 * @param {string} Name
 * @param {string} BusinessId
 * @param {string} TableName
 * @returns {Object}
 */
const validate_name = async (ItemName, Name, BusinessId, TableName) => {

    let response = {
        statusCode: 200,
        isBase64Encoded: false,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify({ message: `Validate ${ItemName} name.` })
    };

    try {
        response = await get_by_name(ItemName, Name, BusinessId, TableName);
        let result = JSON.parse(response.body);
        // Check if the result.Count contain a value, the name already exists
        if (result.count == 0) {
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
                item: result.items[0]
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
    delete_one,
    get_all,
    get_by_name,
    get_ordered,
    update_one,
    validate_name
};