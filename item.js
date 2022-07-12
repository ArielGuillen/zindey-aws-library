const dynamoDB = require('./dynamoDB');
const uuid = require('uuid');

/**
 * @description
 * @param {Object} params           Object with the parmameters required
 * @param {string} params.ItemName
 * @param {boolean} params.ValidateName    Boolean value to check if validate Name is required
 * @param {Object} params.Body
 * @param {string} params.TableName
 * @returns {Object} 
 */
const create_one = async (params) => {

    let validationResponse = {};
    let status;
    //create the response object
    let response = {
        statusCode: 200,
        isBase64Encoded: false,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify({ message: `Create ${params?.ItemName}.` })
    };
    if (params?.ValidateName) {
        try {
            validationResponse = await validate_name({
                ItemName: params?.ItemName,
                Name: params?.Body?.name,
                BusinessId: params?.Body?.businessId,
                TableName: params?.TableName
            });
        } catch (error) {
            console.log(error)
            response.statusCode = 500;
            response.body = JSON.stringify({
                message: `Failed to validate ${params?.ItemName}.`,
                error: error.message
            })
        }
        const bodyReq = JSON.parse(validationResponse.body);
        status = bodyReq.status;
    } else {
        status = true;
    }
    if (status) {
        const id = uuid.v4();
        const newItem = {
            id,
            ...params?.Body
        };
        try {
            response = await dynamoDB.createItem({
                ItemName: params?.ItemName,
                Item: newItem,
                TableName: params?.TableName
            });
        } catch (error) {
            console.error(error);
            response.statusCode = 500;
            response.body = JSON.stringify({
                message: `Failed to create ${params?.ItemName}`,
                error: error.message
            });
        }
    } else {
        response.statusCode = 403;
        response.body = JSON.stringify({
            message: `Failed to create ${params?.ItemName}.`,
            error: `${ItemName} "${params?.Body?.name}" already exists.`
        });
    }
    return response;
}


/**
 * @description
 * @param {Object} params           Object with the parmameters required
 * @param {string} params.ItemName
 * @param {string} params.Id
 * @param {string} params.BusinessId
 * @param {string} params.TableName
 * @returns {Object}
 */
const delete_one = async (params) => {
    let response = {
        isBase64Encoded: false,
        statusCode: 200,
        body: JSON.stringify({ message: `Delete ${params?.ItemName}.` }),
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
    }
    try {
        response = await dynamoDB.deleteItem({
            Key: {
                businessId: params?.BusinessId,
                id: params?.Id
            },
            ItemName: params?.ItemName,
            TableName: params?.TableName,
            response
        });
    } catch (error) {
        console.log(error)
        response.statusCode = 500
        response.body = JSON.stringify({
            message: `Failed to delete ${params?.ItemName}.`,
            error: error.message
        })
    }
    return response
}

/**
 * @description
 * @param {Object} params           Object with the parmameters required
 * @param {string} params.ItemName
 * @param {string} params.StartKey
 * @param {string} params.Limit
 * @param {string} params.BusinessId
 * @param {string} params.TableName
 * @returns {Object}
 */
const get_all = async (params) => {

    //create the response object
    let response = {
        statusCode: 200,
        isBase64Encoded: false,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify({ message: `Get all ${params?.ItemName}.` })
    };

    try {
        response = await dynamoDB.getItems({
            ItemName: params?.ItemName,
            StartKey: params?.StartKey,
            Limit: params?.Limit,
            BusinessId: params?.BusinessId,
            TableName: params?.TableName,
            response
        });
    } catch (error) {
        console.error(error);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: `Failed to get ${params?.ItemName}.`,
            error: error.message
        });
    }

    return response;
}

/**
 * @description
 * @param {Object} params           Object with the parmameters required
 * @param {string} params.ItemName
 * @param {Object} params.Name
 * @param {string} params.BusinessId
 * @param {string} params.TableName
 * @returns {Object}
 */
const get_by_name = async (params) => {

    //create the response object
    let response = {
        statusCode: 200,
        isBase64Encoded: false,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify({ message: `Get ${params?.ItemName}.` })
    };

    try {
        response = await dynamoDB.getItemByName({
            ItemName: params?.ItemName,
            GSIName: 'GSIFindByName',
            AttributeName: 'name',
            AttributeValue: params?.Name,
            BusinessId: params?.BusinessId,
            TableName: params?.TableName,
            response
        });
    } catch (error) {
        console.error(error);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: `Failed to get ${params?.ItemName}.`,
            error: error.message
        });
    }

    return response;
}

/**
 * @description
 * @param {Object} params             Object with the parmameters required
 * @param {string} params.ItemName
 * @param {string} params.DateValue   Attribute value to find
 * @param {string} params.BusinessId
 * @param {string} params.TableName
 * @returns {Object}
 */
const get_by_date = async (params) => {

    //create the response object
    let response = {
        statusCode: 200,
        isBase64Encoded: false,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify({ message: `Get ${params?.ItemName}.` })
    };

    try {
        response = await dynamoDB.getItemByAttribute( {
                ItemName: params?.ItemName,
                GSIName: 'GSIFindByDate',
                AttributeName: 'date',
                AttributeValue: params?.DateValue,
                BusinessId: params?.BusinessId,
                TableName: params?.TableName,
                response
        });
    } catch (error) {
        console.error(error);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: `Failed to get ${params?.ItemName}.`,
            error: error.message
        });
    }

    return response;
}

/**
 * @description
 * @param {Object} params           Object with the parmameters required
 * @param {string} params.ItemName
 * @param {string} params.Order    Send DESC for descending order
 * @param {string} params.GSIName  Global Secondary Index to query
 * @param {string} params.BusinessId
 * @param {string} params.TableName
 * @returns {Object}
 */
const get_ordered = async (params) => {

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
        let Sorting = params?.Order == 'DESC' ?
            false : true
        response = await dynamoDB.getItemOrderedByGSI({
            Sorting, 
            ItemName: params?.ItemName, 
            GSIName: params?.GSIName, 
            BusinessId: params?.BusinessId, 
            TableName: params?.TableName, 
            response
        });

    } catch (error) {
        console.error(error);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: `Failed to get ${params?.ItemName}.`,
            error: error.message
        });
    }

    return response;
}

/**
 * @description
 * @param {Object} params           Object with the parmameters required
 * @param {string} params.ItemName
 * @param {boolean} params.ValidateName    Boolean value to check if validate Name is required
 * @param {Object} params.Req
 * @param {string} params.BusinessId
 * @param {string} params.Id
 * @param {string} params.TableName
 * @returns {Object}
 */
const update_one = async (params) => {

    let validationResponse = {}
    let status;

    //create the response object
    let response = {
        statusCode: 200,
        isBase64Encoded: false,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify({ message: `Update ${params?.ItemName}.` })
    };

    //  check if validate Name is required
    if (params?.ValidateName) {
        // Validate name before update
        try {
            validationResponse = await validate_name({
                ItemName: params?.ItemName,
                Name: params?.Req?.name,
                BusinessId: params?.BusinessId,
                TableName: params?.TableName
            });
        } catch (error) {
            response.statusCode = 500
            response.body = JSON.stringify({
                message: "Failed to validate item.",
                error: error.message
            })
        }
        const bodyReq = JSON.parse(validationResponse.body);
        status = bodyReq.status;
    }
    else {
        status = true;
    }
    if (status || bodyReq?.item?.id == Id) {
        try {
            const ItemParams = Object.keys(params?.Req);
            response = await dynamoDB.updateItem({
                ItemName: params?.ItemName, 
                ItemParams, 
                Req: params?.Req, 
                Key: {
                    businessId: params?.BusinessId,
                    id: params?.Id
                }, 
                TableName: params?.TableName, 
                response
            });
        } catch (error) {
            console.error(error);
            response.statusCode = 500;
            response.body = JSON.stringify({
                message: `Failed to update ${params?.ItemName}`,
                error: error.message
            });
        }
    }else {
        response.statusCode = 403;
        response.body = JSON.stringify({
            message: "Failed to update item.",
            error: `Item -${params?.Req?.Name}- already exists.`,
        })
    }

    return response;
}

/**
 * @description
 * @param {Object} params           Object with the parmameters required
 * @param {string} params.ItemName
 * @param {string} params.Name
 * @param {string} params.BusinessId
 * @param {string} params.TableName
 * @returns {Object}
 */
const validate_name = async (params) => {

    let response = {
        statusCode: 200,
        isBase64Encoded: false,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify({ message: `Validate ${params?.ItemName} name.` })
    };

    try {
        response = await get_by_name({
            ItemName: params?.ItemName, 
            Name: params?.Name, 
            BusinessId: params?.BusinessId, 
            TableName: params?.TableName
        });
        let result = JSON.parse(response.body);
        // Check if the result.Count contain a value, the name already exists
        if (result.count == 0) {
            response.body = JSON.stringify({
                status: true,
                message: `${params?.ItemName} name ${params?.Name} available.`,
            });
        }
        else {
            response.statusCode = 403;
            response.body = JSON.stringify({
                status: false,
                message: `${params?.ItemName} ${params?.Name} already exists.`,
                item: result.items[0]
            });
        }
    } catch (error) {
        console.log(error);
        response.statusCode = 500;
        response.body = JSON.stringify({
            status: false,
            message: `Failed to validate ${params?.ItemName}.`,
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
    get_by_date,
    get_ordered,
    update_one,
    validate_name
};